/**
 * Bank Statement Parsers
 * 
 * This module provides a flexible system for parsing bank statements from different Brazilian banks.
 * Each parser implements the BankParser interface with detect() and parse() methods.
 * 
 * Supported formats:
 * - Bradesco (PDF to Excel exports with __EMPTY columns)
 * - Itaú (Online statement downloads)
 * - Santander (Standard CSV/Excel exports)
 * - Generic (Any spreadsheet with Date, Description, Amount columns)
 * 
 * To add a new bank:
 * 1. Create a new BankParser object
 * 2. Implement detect() to identify the format
 * 3. Implement parse() to extract transaction data
 * 4. Add to the parsers array (before GenericParser)
 */

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  memo?: string;
  document?: string;
}

export interface BankParser {
  name: string;
  detect: (firstRow: any, allRows: any[]) => boolean;
  parse: (row: any) => ParsedTransaction | null;
}

/**
 * Utility Functions
 */

/**
 * Convert Excel serial number to Date (local time, not UTC)
 * Excel's epoch is Dec 30, 1899 and has a leap year bug for 1900
 */
export function excelSerialToDate(serial: number): Date {
  // Excel dates are "local" - they don't have timezone
  // Base date: Dec 30, 1899
  const daysOffset = serial > 59 ? serial - 1 : serial; // Adjust for Excel's 1900 leap year bug
  
  // Create date by adding days directly (avoiding timezone conversion)
  const date = new Date(1899, 11, 30); // Dec 30, 1899 in local time
  date.setDate(date.getDate() + daysOffset);
  
  return date;
}

export function parseBrazilianDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  
  const str = String(dateStr).trim();
  
  // DD/MM/YYYY
  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  let match = str.match(ddmmyyyy);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }
  
  // DD-MM-YYYY
  const ddmmyyyyDash = /^(\d{2})-(\d{2})-(\d{4})$/;
  match = str.match(ddmmyyyyDash);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }
  
  // Excel date number
  if (typeof dateStr === 'number' && dateStr > 40000 && dateStr < 60000) {
    return excelSerialToDate(dateStr);
  }
  
  // Try standard Date parse as fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  return null;
}

export function parseBrazilianCurrency(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  
  const str = String(value)
    .replace(/[^\d,.-]/g, '') // Remove R$, spaces, etc.
    .replace('.', '')          // Remove thousands separator
    .replace(',', '.');        // Convert decimal separator
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? null : Math.abs(parsed);
}

export function findValueByKeys(row: any, keys: string[]): any {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return null;
}

/**
 * Extract account information from Bradesco statement header
 * Looks for "Agência: XXXX Conta: XXXXX-X" pattern in first rows
 */
export function extractAccountInfo(allRows: any[]): {
  bank_id: string;
  branch_id: string;
  account_id: string;
  acct_type: string;
} | null {
  // Search first 10 rows for account info
  for (const row of allRows.slice(0, 10)) {
    const values = Object.values(row).join(' ');
    
    // Pattern: "Agência: 3832 Conta: 47578-5" or "Ag: 3832 Cc: 47578-5"
    const match = values.match(/(?:Agência|Ag(?:ê|e)ncia|Ag)[:.\s]*(\d+).*?(?:Conta|Cc|C\/C)[:.\s]*([\d-]+)/i);
    
    if (match) {
      console.log(`🏦 Conta detectada - Agência: ${match[1]}, Conta: ${match[2]}`);
      return {
        bank_id: '237', // Código FEBRABAN do Bradesco
        branch_id: match[1],
        account_id: match[2],
        acct_type: 'checking',
      };
    }
  }
  
  return null;
}

/**
 * Bradesco Parser
 * 
 * Format: PDF to Excel exports that use __EMPTY, __EMPTY_1, etc. as column names
 * Columns: Data | Lançamento | Dcto. | Crédito (R$) | Débito (R$) | Saldo (R$)
 */
export const BradescoParser: BankParser = {
  name: 'Bradesco',
  
  detect: (firstRow: any, allRows: any[]) => {
    const keys = Object.keys(firstRow);
    const hasEmptyColumns = keys.some(k => k.startsWith('__EMPTY'));
    
    // Check if any row contains "Extrato de:" which is typical of Bradesco
    const hasExtratoText = allRows.some(row => 
      Object.values(row).some(val => 
        String(val).includes('Extrato de:')
      )
    );
    
    return hasEmptyColumns && hasExtratoText;
  },
  
  parse: (row: any) => {
    const skipPatterns = [
      /^data$/i,
      /^saldo anterior/i,
      /^extrato de:/i,
      /^agência:/i,
      /^lançamento$/i,
      /^total/i,
      /^\s*$/
    ];
    
    const description = findValueByKeys(row, ['__EMPTY_1', 'Lançamento', 'Lancamento']);
    
    // Skip invalid rows
    if (!description || skipPatterns.some(pattern => pattern.test(String(description)))) {
      return null;
    }
    
    // Parse date - handle both string format and Excel serial numbers
    const dateValue = findValueByKeys(row, ['__EMPTY', 'Data']);
    let date: Date | null = null;
    
    if (typeof dateValue === 'number' && dateValue > 40000 && dateValue < 60000) {
      // Excel date serial number (e.g., 45505 = 31/07/2025)
      date = excelSerialToDate(dateValue);
      console.log(`📅 Excel serial ${dateValue} → ${date.toLocaleDateString('pt-BR')}`);
    } else {
      date = parseBrazilianDate(dateValue);
    }
    
    if (!date || isNaN(date.getTime())) {
      console.log('❌ Data inválida:', dateValue);
      return null;
    }
    
    // Parse amounts
    const creditValue = findValueByKeys(row, ['__EMPTY_3', 'Crédito (R$)', 'Crédito', 'Credito']);
    const debitValue = findValueByKeys(row, ['__EMPTY_4', 'Débito (R$)', 'Débito', 'Debito']);
    
    const creditAmount = parseBrazilianCurrency(creditValue);
    const debitAmount = parseBrazilianCurrency(debitValue);
    
    let amount: number;
    let type: 'CREDIT' | 'DEBIT';
    
    if (creditAmount && creditAmount > 0) {
      amount = creditAmount;
      type = 'CREDIT';
    } else if (debitAmount && debitAmount > 0) {
      amount = debitAmount;
      type = 'DEBIT';
    } else {
      return null; // No valid amount
    }
    
    const document = findValueByKeys(row, ['__EMPTY_2', 'Dcto.', 'Documento']);
    
    return {
      date,
      description: String(description).trim(),
      amount,
      type,
      document: document ? String(document) : undefined,
    };
  }
};

/**
 * Itaú Parser
 * 
 * Format: Online statement downloads with standard Portuguese column names
 */
export const ItauParser: BankParser = {
  name: 'Itaú',
  
  detect: (firstRow: any) => {
    const keys = Object.keys(firstRow).map(k => k.toLowerCase());
    return keys.includes('lançamento') || keys.includes('lancamento') || 
           (keys.includes('data') && keys.includes('histórico'));
  },
  
  parse: (row: any) => {
    const dateValue = findValueByKeys(row, ['data', 'Data', 'DATE']);
    const date = parseBrazilianDate(dateValue);
    if (!date) return null;
    
    const description = findValueByKeys(row, ['histórico', 'Histórico', 'historico', 'Historico', 'lançamento', 'Lançamento', 'lancamento', 'Lancamento', 'descrição', 'Descrição', 'descricao', 'Descricao']);
    if (!description) return null;
    
    const valueStr = findValueByKeys(row, ['valor', 'Valor', 'VALUE', 'amount', 'Amount']);
    const amount = parseBrazilianCurrency(valueStr);
    if (!amount) return null;
    
    // Determine type from value sign or type column
    const typeValue = findValueByKeys(row, ['tipo', 'Tipo', 'type', 'Type']);
    let type: 'CREDIT' | 'DEBIT' = 'DEBIT';
    
    if (typeValue) {
      const typeStr = String(typeValue).toLowerCase();
      type = typeStr.includes('crédit') || typeStr.includes('credit') || typeStr.includes('entrada') ? 'CREDIT' : 'DEBIT';
    } else if (String(valueStr).includes('-')) {
      type = 'DEBIT';
    } else {
      type = 'CREDIT';
    }
    
    return {
      date,
      description: String(description).trim(),
      amount,
      type,
    };
  }
};

/**
 * Santander Parser
 */
export const SantanderParser: BankParser = {
  name: 'Santander',
  
  detect: (firstRow: any) => {
    const keys = Object.keys(firstRow).map(k => k.toLowerCase());
    return keys.includes('movimiento') || keys.includes('movimento') ||
           (keys.includes('fecha') && keys.includes('concepto'));
  },
  
  parse: (row: any) => {
    const dateValue = findValueByKeys(row, ['fecha', 'Fecha', 'data', 'Data']);
    const date = parseBrazilianDate(dateValue);
    if (!date) return null;
    
    const description = findValueByKeys(row, ['concepto', 'Concepto', 'movimento', 'Movimento', 'descrição', 'Descrição']);
    if (!description) return null;
    
    const valueStr = findValueByKeys(row, ['importe', 'Importe', 'valor', 'Valor']);
    const amount = parseBrazilianCurrency(valueStr);
    if (!amount) return null;
    
    const type: 'CREDIT' | 'DEBIT' = String(valueStr).includes('-') ? 'DEBIT' : 'CREDIT';
    
    return {
      date,
      description: String(description).trim(),
      amount,
      type,
    };
  }
};

/**
 * Generic Parser (Fallback)
 * 
 * Handles any spreadsheet with common column names
 */
export const GenericParser: BankParser = {
  name: 'Genérico',
  
  detect: () => true, // Always matches as fallback
  
  parse: (row: any) => {
    // Try to find date
    const dateValue = findValueByKeys(row, [
      'data', 'Data', 'DATE', 'date',
      'fecha', 'Fecha',
      '__EMPTY'
    ]);
    const date = parseBrazilianDate(dateValue);
    if (!date) return null;
    
    // Try to find description
    const description = findValueByKeys(row, [
      'descrição', 'Descrição', 'descricao', 'Descricao',
      'description', 'Description', 'DESCRIPTION',
      'histórico', 'Histórico', 'historico', 'Historico',
      'lançamento', 'Lançamento', 'lancamento', 'Lancamento',
      'memo', 'Memo', 'MEMO',
      '__EMPTY_1'
    ]);
    if (!description) return null;
    
    // Try to find amount
    const valueStr = findValueByKeys(row, [
      'valor', 'Valor', 'VALUE', 'value',
      'amount', 'Amount', 'AMOUNT',
      'importe', 'Importe',
      '__EMPTY_3', '__EMPTY_4'
    ]);
    const amount = parseBrazilianCurrency(valueStr);
    if (!amount) return null;
    
    // Try to determine type
    const typeValue = findValueByKeys(row, ['tipo', 'Tipo', 'type', 'Type', 'TYPE']);
    let type: 'CREDIT' | 'DEBIT' = 'DEBIT';
    
    if (typeValue) {
      const typeStr = String(typeValue).toLowerCase();
      type = typeStr.includes('crédit') || typeStr.includes('credit') || 
             typeStr.includes('entrada') || typeStr.includes('c') ? 'CREDIT' : 'DEBIT';
    } else if (String(valueStr).includes('-')) {
      type = 'DEBIT';
    }
    
    return {
      date,
      description: String(description).trim(),
      amount,
      type,
    };
  }
};

/**
 * Parser Detection System
 */
export const parsers: BankParser[] = [
  BradescoParser,
  ItauParser,
  SantanderParser,
  GenericParser, // Always last as fallback
];

export function detectParser(data: any[]): BankParser {
  if (!data || data.length === 0) {
    return GenericParser;
  }
  
  const firstRow = data[0];
  
  for (const parser of parsers) {
    if (parser.detect(firstRow, data)) {
      return parser;
    }
  }
  
  return GenericParser;
}
