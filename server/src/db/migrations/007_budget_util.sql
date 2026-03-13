-- server/src/db/migrations/007_budget_utilization_view.sql
BEGIN;

CREATE OR REPLACE VIEW budget_utilization AS
SELECT
  b.id                                          AS budget_id,
  b.user_id,
  b.period_type,
  b.period_start,
  b.period_end,
  b.allowance_amount,

  -- Per-category breakdown
  c.id                                          AS category_id,
  c.name                                        AS category_name,
  c.icon_key,
  c.color,
  bi.amount                                     AS allocated,

  -- Actual spend in this period from transactions
  COALESCE(SUM(
    CASE
      WHEN t.type = 'expense'
       AND t.occurred_at::date BETWEEN b.period_start AND b.period_end
      THEN t.amount
      ELSE 0
    END
  ), 0)                                         AS spent,

  -- Remaining for this category
  bi.amount - COALESCE(SUM(
    CASE
      WHEN t.type = 'expense'
       AND t.occurred_at::date BETWEEN b.period_start AND b.period_end
      THEN t.amount
      ELSE 0
    END
  ), 0)                                         AS remaining

FROM budgets b
JOIN budget_items bi  ON bi.budget_id   = b.id
JOIN categories   c   ON c.id           = bi.category_id
LEFT JOIN transactions t
  ON  t.user_id     = b.user_id
  AND t.category_id = c.id

GROUP BY
  b.id, b.user_id, b.period_type, b.period_start, b.period_end,
  b.allowance_amount, c.id, c.name, c.icon_key, c.color, bi.amount;

COMMIT;
