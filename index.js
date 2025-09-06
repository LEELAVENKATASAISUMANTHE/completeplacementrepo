import { app } from './app.js';


const port = process.env.PORT || 3000;

app.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`);
});
