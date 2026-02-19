import { ZeppClient } from '../api/zepp-client';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('Usage: npx ts-node src/scripts/get-token.ts <email> <password>');
    process.exit(1);
}

console.log(`Authenticating ${email}...`);

const client = new ZeppClient();
client.authenticate(email, password)
    .then(credential => {
        console.log('\n✅ SUCCESS! Here are your credentials:\n');
        console.log(`appToken: "${credential.appToken}"`);
        console.log(`zeppUserId: "${credential.userId}"`);
        console.log('\nCopy these values into your registration command.');
    })
    .catch(err => {
        console.error('\n❌ Error:', err.message);
        if (err.message.includes('429')) {
            console.error('You are also rate limited locally. Try connecting to a different network (Phone Hotspot/VPN) and try again.');
        }
    });
