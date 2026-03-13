BEGIN;

CREATE OR REPLACE FUNCTION seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$

BEGIN 
    INSERT INTO categories (user_id, name, description, icon_key, color)
    VALUES 
    (p_user_id, 'Transport', 'Commute, Grab, Fuel','directions-bus', '#197fe6'),
    (p_user_id, 'Food', 'Groceries, Dining out','restaurant','#ea580c'),
    (p_user_id, 'Savings', 'Emergency, Travel fund', 'savings', '#10b981'),
    (p_user_id, 'Others','Miscellaneous','more-horiz','#64748b')
    
    ON CONFLICT (user_id, name) DO NOTHING;

    RETURN;
END;

$$ LANGUAGE plpgsql;

COMMIT;
