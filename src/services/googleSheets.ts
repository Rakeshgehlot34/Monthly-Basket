import { Transaction, DynamicSection, BudgetConfig } from '../types';

export const SPREADSHEET_TITLE = 'SpendSync - Monthly Finance Tracker';

export interface SheetInitResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  isNew: boolean;
}

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';

export class GoogleSheetsService {
  /**
   * Search for an existing SpendSync spreadsheet or create a new one.
   */
  static async getOrCreateSpreadsheet(accessToken: string, existingId?: string): Promise<SheetInitResult> {
    if (existingId) {
      try {
        const verifyRes = await fetch(`${SHEETS_BASE}/${existingId}?fields=spreadsheetId,spreadsheetUrl,properties.title`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (verifyRes.ok) {
          const data = await verifyRes.json();
          return {
            spreadsheetId: data.spreadsheetId,
            spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
            isNew: false,
          };
        }
      } catch (err) {
        console.warn('Could not verify existing spreadsheetId, searching drive...', err);
      }
    }

    // Search user's Drive for existing file
    try {
      const searchUrl = `${DRIVE_BASE}/files?q=name='${encodeURIComponent(SPREADSHEET_TITLE)}' and trashed=false&fields=files(id, name, webViewLink)`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.files && data.files.length > 0) {
          const file = data.files[0];
          return {
            spreadsheetId: file.id,
            spreadsheetUrl: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
            isNew: false,
          };
        }
      }
    } catch (e) {
      console.warn('Failed drive search, creating new sheet...', e);
    }

    // Create a new spreadsheet
    return await this.createNewSpreadsheet(accessToken);
  }

  /**
   * Create a new structured spreadsheet with Transactions, DailySections, and Settings tabs
   */
  static async createNewSpreadsheet(accessToken: string): Promise<SheetInitResult> {
    const payload = {
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: 'Transactions',
            gridProperties: { frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: 'DailySections',
            gridProperties: { frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: 'Budgets',
            gridProperties: { frozenRowCount: 1 },
          },
        },
      ],
    };

    const res = await fetch(SHEETS_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create Google Spreadsheet: ${err}`);
    }

    const created = await res.json();
    const spreadsheetId = created.spreadsheetId;
    const spreadsheetUrl = created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // Initialize headers in the newly created sheet
    await this.initializeHeaders(accessToken, spreadsheetId);

    return {
      spreadsheetId,
      spreadsheetUrl,
      isNew: true,
    };
  }

  /**
   * Write header rows to all tabs
   */
  static async initializeHeaders(accessToken: string, spreadsheetId: string): Promise<void> {
    const headerData = [
      {
        range: 'Transactions!A1:P1',
        values: [
          [
            'ID',
            'Date',
            'Month',
            'Type',
            'Category',
            'Title',
            'Amount',
            'Payment Method',
            'Notes',
            'Section ID',
            'Unit',
            'Quantity',
            'Unit Price',
            'Created By',
            'Role',
            'Timestamp',
          ],
        ],
      },
      {
        range: 'DailySections!A1:I1',
        values: [
          [
            'Section ID',
            'Section Name',
            'Icon',
            'Color',
            'Unit',
            'Default Unit Price',
            'Pinned to Top Nav',
            'Nav Order',
            'Description',
          ],
        ],
      },
      {
        range: 'Budgets!A1:E1',
        values: [
          ['Month (YYYY-MM)', 'Overall Budget', 'Currency', 'Rollover Enabled', 'Last Updated'],
        ],
      },
    ];

    await fetch(`${SHEETS_BASE}/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: headerData,
      }),
    });
  }

  /**
   * Sync all transactions to Google Sheet
   */
  static async syncAllTransactions(
    accessToken: string,
    spreadsheetId: string,
    transactions: Transaction[]
  ): Promise<boolean> {
    const rows = transactions.map((tx) => [
      tx.id,
      tx.date,
      tx.month,
      tx.type,
      tx.category,
      tx.title,
      tx.amount,
      tx.paymentMethod,
      tx.notes || '',
      tx.sectionId || '',
      tx.unit || '',
      tx.quantity !== undefined ? tx.quantity : '',
      tx.unitPrice !== undefined ? tx.unitPrice : '',
      tx.createdBy || '',
      tx.role || '',
      new Date(tx.timestamp).toISOString(),
    ]);

    // 1. Clear old data starting from row 2
    await fetch(`${SHEETS_BASE}/${spreadsheetId}/values/Transactions!A2:P:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (rows.length === 0) return true;

    // 2. Write new rows
    const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}/values/Transactions!A2:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    });

    return res.ok;
  }

  /**
   * Sync dynamic procurement sections to Google Sheet
   */
  static async syncAllSections(
    accessToken: string,
    spreadsheetId: string,
    sections: DynamicSection[]
  ): Promise<boolean> {
    const rows = sections.map((sec) => [
      sec.id,
      sec.name,
      sec.icon,
      sec.color,
      sec.unit,
      sec.defaultUnitPrice,
      sec.isFavorite ? 'TRUE' : 'FALSE',
      sec.navOrder,
      sec.description || '',
    ]);

    await fetch(`${SHEETS_BASE}/${spreadsheetId}/values/DailySections!A2:I:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (rows.length === 0) return true;

    const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}/values/DailySections!A2:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    });

    return res.ok;
  }

  /**
   * Sync Budgets to Google Sheet
   */
  static async syncBudgets(
    accessToken: string,
    spreadsheetId: string,
    budgets: Record<string, BudgetConfig>
  ): Promise<boolean> {
    const rows = Object.values(budgets).map((b) => [
      b.month,
      b.overallBudget,
      b.currencySymbol,
      b.rolloverEnabled ? 'TRUE' : 'FALSE',
      new Date().toISOString(),
      JSON.stringify(b.groupBudgets || {}),
    ]);

    await fetch(`${SHEETS_BASE}/${spreadsheetId}/values/Budgets!A2:F:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (rows.length === 0) return true;

    const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}/values/Budgets!A2:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rows }),
    });

    return res.ok;
  }

  /**
   * Load all data from Google Sheet
   */
  static async loadAllData(
    accessToken: string,
    spreadsheetId: string
  ): Promise<{
    transactions: Transaction[];
    sections: DynamicSection[];
    budgets: Record<string, BudgetConfig>;
  } | null> {
    const ranges = [
      'Transactions!A2:P',
      'DailySections!A2:I',
      'Budgets!A2:F',
    ];

    const url = `${SHEETS_BASE}/${spreadsheetId}/values:batchGet?ranges=${ranges.join('&ranges=')}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      console.error('Failed to load data from Google Sheet:', await res.text());
      return null;
    }

    const data = await res.json();
    const valueRanges = data.valueRanges || [];

    // Parse Transactions
    const txRows = valueRanges[0]?.values || [];
    const transactions: Transaction[] = txRows
      .filter((row: any[]) => row && row[0])
      .map((r: any[]) => ({
        id: String(r[0] || ''),
        date: String(r[1] || new Date().toISOString().slice(0, 10)),
        month: String(r[2] || (r[1] ? String(r[1]).slice(0, 7) : '')),
        type: (String(r[3]).toLowerCase() === 'income' ? 'income' : 'expense') as 'expense' | 'income',
        category: String(r[4] || 'Miscellaneous Expense'),
        title: String(r[5] || 'Transaction'),
        amount: Number(r[6]) || 0,
        paymentMethod: (r[7] || 'Cash') as any,
        notes: r[8] ? String(r[8]) : undefined,
        sectionId: r[9] ? String(r[9]) : undefined,
        unit: r[10] ? String(r[10]) : undefined,
        quantity: r[11] ? Number(r[11]) : undefined,
        unitPrice: r[12] ? Number(r[12]) : undefined,
        createdBy: r[13] ? String(r[13]) : undefined,
        role: r[14] ? (String(r[14]) as any) : undefined,
        timestamp: r[15] ? new Date(r[15]).getTime() : Date.now(),
        synced: true,
      }));

    // Parse Sections
    const secRows = valueRanges[1]?.values || [];
    const sections: DynamicSection[] = secRows
      .filter((row: any[]) => row && row[0])
      .map((r: any[]) => ({
        id: String(r[0] || ''),
        name: String(r[1] || 'Dynamic Section'),
        icon: String(r[2] || 'Package'),
        color: String(r[3] || '#3b82f6'),
        unit: String(r[4] || 'Unit'),
        defaultUnitPrice: Number(r[5]) || 0,
        isFavorite: String(r[6]).toUpperCase() === 'TRUE',
        navOrder: Number(r[7]) || 1,
        description: r[8] ? String(r[8]) : undefined,
        createdAt: Date.now(),
      }));

    // Parse Budgets
    const budgetRows = valueRanges[2]?.values || [];
    const budgets: Record<string, BudgetConfig> = {};
    budgetRows
      .filter((row: any[]) => row && row[0])
      .forEach((r: any[]) => {
        const month = String(r[0]);
        let groupBudgets: Record<string, number> | undefined = undefined;
        if (r[5]) {
          try {
            groupBudgets = JSON.parse(r[5]);
          } catch {
            // ignore
          }
        }
        budgets[month] = {
          month,
          overallBudget: Number(r[1]) || 50000,
          currencySymbol: String(r[2] || '₹'),
          rolloverEnabled: String(r[3]).toUpperCase() === 'TRUE',
          groupBudgets,
        };
      });

    return { transactions, sections, budgets };
  }
}
