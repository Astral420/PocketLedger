import pool from "../config/DB";

export interface BudgetItem {
    category_id: string;
    category_name: string;
    icon_key: string | null;
    color: string | null;
    allocatedBudget: number;
    spentAmount: number;
    remainingAmount: number;
}

export interface Budget {
    id: string;
    period_type: "weekly" | "monthly";
    period_start: string;
    period_end: string;
    allowance_amount: number;
    total_allocated: number;
    total_spent: number;
    items: BudgetItem [];
}

export interface upsertBudgetPayload {
    period_type: "weekly" | "monthly";
    allowance_amount: number;
    items: { category_id: string, amount: number} [] ;
}

export const getCurrentPeriodRange = (type: "weekly" | "monthly") : { start: string; end: string } => {

  const now = new Date();

  if (type === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return { start: toDateString(start), end: toDateString(end) };
  }

  const day   = now.getDay() === 0 ? 7 : now.getDay(); // Sunday = 7
  const start = new Date(now);

  start.setDate(now.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start: toDateString(start), end: toDateString(end) };
};

const toDateString = (d: Date) => d.toISOString().split("T")[0];

const getBudgetById = async (budgetId: string, userId: string):
Promise<Budget> => {
    const query = `
     SELECT budget_id AS id, period_type, period_start, period_end, allowance_amount,
            category_id, category_name, icon_key, color, allocated, spent, remaining
     FROM budget_utilization
     WHERE budget_id = $1 AND user_id = $2
    `;

    interface BudgetUtilization {
        id: string;
        period_type: string;
        period_start: string;
        period_end: string;
        allowance_amount: number;
        category_id: string;
        category_name: string;
        icon_key:string | null;
        color: string | null;
        allocated: number;
        spent: number;
        remaining: number;

    } 

    const values = [budgetId, userId];

    const { rows } = await pool.query<BudgetUtilization>(query, values);

    if (!rows[0]) throw new Error ("Budget not found");

    const first = rows[0];
    const totalAllocated = rows.reduce((s, r) => s + r.allocated, 0);
    const totalSpent = rows.reduce((s, r) => s + r.spent, 0); 

    return {
    id:               first.id,
    period_type:      first.period_type as "weekly" | "monthly",
    period_start:     first.period_start,
    period_end:       first.period_end,
    allowance_amount: first.allowance_amount,
    total_allocated:  totalAllocated,
    total_spent:      totalSpent,

    items: rows.map((r) => ({
      category_id:   r.category_id,
      category_name: r.category_name,
      icon_key:      r.icon_key,
      color:         r.color,
      allocatedBudget:     r.allocated,
      spentAmount:         r.spent,
      remainingAmount:     r.remaining,
    })),
  };
};
   
export const upsertBudget = async (userId: string, payload: upsertBudgetPayload): 
Promise<Budget> => {
    const { start, end } = getCurrentPeriodRange(payload.period_type);
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const insertQuery = `
        INSERT INTO budgets (user_id, period_type, period_start, period_end, allowance_amount)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (user_id, period_type, period_start, period_end)
        DO UPDATE SET allowance_amount = EXCLUDED.allowance_amount,
        updated_at = NOW()
        RETURNING id, period_type, period_start, period_end, allowance_ammount
        `;

        const insertValues = [userId, payload.period_type, start, end, payload.allowance_amount];

        const { rows: budgetRows } = await client.query(insertQuery, insertValues);
        const budget = budgetRows[0];


        //delete or replace all items for this budget period
        const deleteQuery = 'DELETE FROM budget_items WHERE budget_id = $1';
        await client.query(deleteQuery, [budget.id]);

        const insertItemQuery = `INSERT INTO budget_items 
                                (budget_id, category_id, amount)
                                VALUES ($1,$2,$3)`;

       
 
        for (const item of payload.items) {
            if (item.amount > 0 ) {
                await client.query(insertItemQuery,  
                    [budget.id, item.category_id, item.amount]);
            }
        }
        await client.query ("COMMIT");

        return getBudgetById(budget.id, userId);
    } catch (error) {
        await client.query ("ROLLBACK")
        throw error;
    } finally {
        client.release();
    }
};

export const retrieveCurrentBudget = async (userId: string, periodType: "weekly" | "monthly"):
Promise<Budget | null> => {
    
    const query = 
    `
    SELECT DISTINCT budget_id AS id, period_type, period_start, period_end, allowance_amount
    FROM budget_utilization
    WHERE user_id = $1
     AND period_type = $2
     AND CURRENT_DATE BETWEEN period_start AND period_end
    LIMIT 1
    `;

    const values = [userId, periodType];

    const { rows } = await pool.query(query, values);

    if(!rows[0]) return null;
    return getBudgetById (rows[0].id, userId);
};

