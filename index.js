import { app } from './app.js';

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📊 GraphQL playground available at http://localhost:${port}/graphql`);
});
