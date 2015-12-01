ssh -i "My AWS Key.pem" ubuntu@52.10.138.95 'cd app; npm --version > npmversion'
scp -i "My AWS Key.pem" ubuntu@52.10.138.95:app/package.json remote/
scp -i "My AWS Key.pem" ubuntu@52.10.138.95:app/npmversion .
packcomp package.json remote/package.json > diff
node client.js
./jenkins.sh