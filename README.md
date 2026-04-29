# PlanEat

Weekly meal planner PWA for planning menus, managing recipes, and generating shopping lists.

**Live app:** [https://xavierpa91.github.io/planeat/](https://xavierpa91.github.io/planeat/)

## Features

- **Weekly menu planner** - Drag meals into a 7-day grid with configurable meal types (breakfast, lunch, snack, dinner)
- **Recipe management** - Create your own recipes or use 12 built-in Spanish recipes
- **Smart shopping list** - Auto-generated from your weekly menu, grouped by category (Carnes, Pescados, Lacteos, etc.)
- **Shared households** - Share menus and recipes with family members via Google login
- **Copy menus** - Replicate any week's menu to another week
- **PWA** - Install on your phone from the browser, works offline-capable

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Plus Jakarta Sans
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions

## Development

```bash
npm install
npm run dev
```

Create a `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

Run `supabase/migrations/001_initial.sql` in the Supabase SQL Editor, then:

```sql
-- Additional setup
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS icon text;

-- RPC for household creation
CREATE OR REPLACE FUNCTION create_household(household_name text)
RETURNS uuid AS $$
DECLARE new_id uuid;
BEGIN
  INSERT INTO households (name) VALUES (household_name) RETURNING id INTO new_id;
  INSERT INTO household_members (household_id, user_id, role) VALUES (new_id, auth.uid(), 'admin');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## License

Private project.
