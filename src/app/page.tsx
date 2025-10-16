import { neon } from '@neondatabase/serverless';

export default function Page() {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const description = formData.get('description');
    // Insert the comment from the form into the Postgres database
    await sql`INSERT INTO transactions (description) VALUES (${description})`;
  }

  return (
    <form action={create}>
      <input type="text" placeholder="write a comment" name="description" />
      <button type="submit">Submit</button>
    </form>
  );
}