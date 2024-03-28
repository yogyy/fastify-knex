/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("knex_users", (table) => {
    table.increments("id").unique().primary();
    table.string("email").unique().notNullable();
    table.string("username").unique().notNullable();
    table.string("image").defaultTo("");
    table.text("bio").defaultTo("");
    table.string("password").notNullable();
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable("knex_users");
}
