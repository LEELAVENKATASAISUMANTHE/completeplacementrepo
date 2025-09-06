import { app } from './app.js';
import { oauthConsent,oauthCallback,logout} from './controller/oauth.js';
import { setupDatabase } from './db/check.db.js';
import adminRoutes from './routes/admin.routes.js';
const port = process.env.PORT || 3000;

app.listen(port, async () => {
    //await setupDatabase();
    console.log(`Server is running on http://localhost:${port}`);
});


app.use('/', adminRoutes);
