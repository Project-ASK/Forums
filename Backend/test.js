const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.DB_CONNECT);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
    console.log('DB Connected');

    const adminSchema = new mongoose.Schema({
        name: String,
        email: String,
        username: String,
        password: String,
        forum: String
    });

    const Admin = mongoose.model('Admin', adminSchema);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter name: ', async (name) => {
        rl.question('Enter email: ', async (email) => {
            rl.question('Enter username: ', async (username) => {
                rl.question('Enter password: ', async (password) => {
                    rl.question('Enter forum: ', async (forum) => {
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(password, salt);

                        const admin = new Admin({
                            name,
                            email,
                            username,
                            password: hashedPassword,
                            forum
                        });

                        await admin.save();
                        console.log('Admin user created');
                        rl.close();
                        process.exit(0);
                    });
                });
            });
        });
    });
});
