import api from './api';

/**
 * Dashboard Service: Data providers linking live PostgreSQL API endpoints.
 * All metrics, aggregations, and distributions are calculated directly from
 * real backend records. Mock data and hardcoded demo values are eliminated.
 */

export const dashboardService = {
  /**
   * Fetches real KPI metrics from PostgreSQL:
   * 1. Total Sales: sum of grand_total from CREATED invoices only.
   * 2. Total Expenses: sum of amount from expenses table.
   * 3. Total Invoices: count of all invoice records.
   * 4. Total Customers: count of all customer records.
   */
  async getKpis() {
    const [invoicesRes, expensesRes, customersRes] = await Promise.allSettled([
      api.get('/invoices'),
      api.get('/expenses'),
      api.get('/customers'),
    ]);

    const invoices = invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value) ? invoicesRes.value : [];
    const expenses = expensesRes.status === 'fulfilled' && Array.isArray(expensesRes.value) ? expensesRes.value : [];
    const customers = customersRes.status === 'fulfilled' && Array.isArray(customersRes.value) ? customersRes.value : [];

    // Sum grand_total of CREATED invoices only
    const totalSales = invoices
      .filter((inv) => inv.status === 'CREATED')
      .reduce((sum, inv) => sum + (parseFloat(inv.grand_total) || 0), 0);

    // Sum actual expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    const totalInvoicesCount = invoices.length;
    const totalCustomersCount = customers.length;

    return [
      {
        id: 'sales',
        title: 'Total Sales',
        value: `₹${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 'Live DB',
        isPositive: true,
        period: 'from CREATED invoices',
        iconName: 'TrendingUp',
        accentColor: 'indigo',
      },
      {
        id: 'expenses',
        title: 'Total Expenses',
        value: `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 'Live DB',
        isPositive: true,
        period: 'actual expenses',
        iconName: 'Receipt',
        accentColor: 'rose',
      },
      {
        id: 'invoices',
        title: 'Total Invoices',
        value: String(totalInvoicesCount),
        change: 'Live DB',
        isPositive: true,
        period: 'total recorded',
        iconName: 'FileText',
        accentColor: 'violet',
      },
      {
        id: 'customers',
        title: 'Total Customers',
        value: String(totalCustomersCount),
        change: 'Live DB',
        isPositive: true,
        period: 'registered clients',
        iconName: 'Users',
        accentColor: 'cyan',
      },
    ];
  },

  /**
   * Fetches real sales revenue aggregated by time filter (weekly, monthly, yearly).
   * EXCLUDES CANCELLED invoices from all sales revenue metrics.
   */
  async getSalesOverview(filter = 'weekly') {
    let invoices = [];
    try {
      const data = await api.get('/invoices');
      if (Array.isArray(data)) {
        invoices = data.filter((i) => i.status === 'CREATED');
      }
    } catch (e) {
      console.error('Failed to fetch invoices for sales overview:', e);
    }

    if (filter === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const salesByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

      invoices.forEach((inv) => {
        if (!inv.invoice_date) return;
        const d = new Date(inv.invoice_date);
        const dayIdx = (d.getDay() + 6) % 7; // Monday = 0
        const dayName = days[dayIdx];
        if (dayName) {
          salesByDay[dayName] += parseFloat(inv.grand_total) || 0;
        }
      });

      return days.map((day) => ({
        name: day,
        sales: parseFloat(salesByDay[day].toFixed(2)),
        target: 0,
      }));
    }

    if (filter === 'monthly') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const salesByWeek = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };

      invoices.forEach((inv) => {
        if (!inv.invoice_date) return;
        const d = new Date(inv.invoice_date);
        const dateNum = d.getDate();
        let weekKey = 'Week 1';
        if (dateNum > 21) weekKey = 'Week 4';
        else if (dateNum > 14) weekKey = 'Week 3';
        else if (dateNum > 7) weekKey = 'Week 2';

        salesByWeek[weekKey] += parseFloat(inv.grand_total) || 0;
      });

      return weeks.map((week) => ({
        name: week,
        sales: parseFloat(salesByWeek[week].toFixed(2)),
        target: 0,
      }));
    }

    if (filter === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const salesByMonth = {};
      months.forEach((m) => { salesByMonth[m] = 0; });

      invoices.forEach((inv) => {
        if (!inv.invoice_date) return;
        const d = new Date(inv.invoice_date);
        const monthIdx = d.getMonth();
        const monthName = months[monthIdx];
        if (monthName) {
          salesByMonth[monthName] += parseFloat(inv.grand_total) || 0;
        }
      });

      return months.map((month) => ({
        name: month,
        sales: parseFloat(salesByMonth[month].toFixed(2)),
        target: 0,
      }));
    }

    return [];
  },

  /**
   * Fetches real expenses grouped by category with amounts and percentages.
   * Does NOT use mock categories or demo fallback values.
   */
  async getExpenseDistribution() {
    let expenses = [];
    try {
      const data = await api.get('/expenses');
      if (Array.isArray(data)) {
        expenses = data;
      }
    } catch (e) {
      console.error('Failed to fetch expenses for distribution:', e);
    }

    if (expenses.length === 0) {
      return [];
    }

    const totalAmount = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    const categoryColors = {
      Salary: '#6366F1',
      Rent: '#8B5CF6',
      Electricity: '#06B6D4',
      Marketing: '#10B981',
      Transport: '#F59E0B',
      Internet: '#EC4899',
      Maintenance: '#3B82F6',
      Other: '#64748B',
    };

    const categoryTotals = expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (parseFloat(exp.amount) || 0);
      return acc;
    }, {});

    return Object.keys(categoryTotals).map((cat) => ({
      category: cat,
      amount: categoryTotals[cat],
      percentage: totalAmount > 0 ? parseFloat(((categoryTotals[cat] / totalAmount) * 100).toFixed(1)) : 0,
      color: categoryColors[cat] || '#64748B',
    }));
  },

  /**
   * Fetches latest real invoice records mapped with customer names.
   */
  async getRecentInvoices() {
    try {
      const [invoices, customers] = await Promise.all([
        api.get('/invoices'),
        api.get('/customers').catch(() => []),
      ]);

      if (Array.isArray(invoices)) {
        const custMap = (customers || []).reduce((acc, c) => {
          acc[c.customer_id] = c.name;
          return acc;
        }, {});

        return invoices.slice(0, 5).map((inv) => ({
          id: inv.invoice_id,
          invoiceNumber: inv.invoice_number,
          customer: custMap[inv.customer_id] || `Customer #${inv.customer_id}`,
          date: inv.invoice_date,
          grandTotal: `₹${parseFloat(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          status: inv.status,
        }));
      }
    } catch (e) {
      console.error('Failed to fetch recent invoices:', e);
    }

    return [];
  },

  /**
   * Fetches real low-stock product items from PostgreSQL inventory.
   */
  async getLowStockItems() {
    try {
      const lowStock = await api.get('/inventory/low-stock');
      if (Array.isArray(lowStock)) {
        return lowStock.map((item) => ({
          id: item.item_id,
          productName: item.item_name,
          currentStock: item.quantity,
          reorderLevel: item.reorder_level,
          unit: 'units',
          status: item.quantity <= Math.floor(item.reorder_level / 2) ? 'CRITICAL' : 'LOW',
        }));
      }
    } catch (e) {
      console.error('Failed to fetch low stock items:', e);
    }

    return [];
  },
};

export default dashboardService;
