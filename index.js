import { app } from './app.js';
import { setupDatabase } from './db/check.db.js';

const port = process.env.PORT || 3000;

app.listen(port, async () => {
    //await setupDatabase();
    console.log(`Server is running on http://localhost:${port}`);
});
