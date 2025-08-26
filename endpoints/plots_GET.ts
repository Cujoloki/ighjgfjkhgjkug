import { Kysely } from 'kysely';
import { sql } from 'kysely';
import { Database } from '../types/database';

export default async function handler(req, res) {
  try {
    const db = new Kysely<Database>({
      dialect: {
        // Database configuration would go here
      }
    });

    const plots = await db
      .selectFrom('plots')
      .select([
        'plots.id',
        'plots.name',
        'plots.description',
        'plots.category_id',
        'plots.created_at',
        'plots.updated_at',
        db.selectFrom('plot_categories')
          .select(['id', 'name', 'description', 'color', 'created_at'])
          .whereRef('id', '=', 'plots.category_id')
          .as('category'),
        db.selectFrom('rows')
          .select(db.fn.count('id').as('count'))
          .whereRef('plot_id', '=', 'plots.id')
          .as('row_count'),
        db.selectFrom('rows as plotRows')
          .select(db.fn.coalesce(
            db.selectFrom('plotRows')
              .select(db.fn.jsonAgg('plotRows'))
              .whereRef('plotRows.plotId', '=', 'plots.id'),
            sql`'[]'::json` // Kysely requires type casting for json empty array default
          ).as('rows')
      ])
      .execute();

    return res.json({
      plots
    });
  } catch (error) {
    console.error('Error in plots_GET:', error);
    return res.status(500).json({
      error: 'Internal Server Error'
    });
  }
}