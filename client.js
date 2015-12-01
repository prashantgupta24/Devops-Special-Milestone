var AWS = require('aws-sdk');
fs = require('fs');


fs.readFile('diff', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
	fs.readFile('diff_standard', 'utf8', function (err1,data1) {
	  if (err1) {
	    return console.log(err1);
	  }
		if(data1 == data)
		{
	  		console.log("Dependencies are same!");

				fs.readFile('npmversion', 'utf8', function (err,data) {
				  if (err) {
				    return console.log(err);
				  }
					var num=data.trim();

				  if(num != "1.3.11")
					{
						console.log("NPM Version mismatch! Creating new server...")
						newServer.createServer();
					}
					else {
						fs.writeFile('jenkins.sh', "curl http://localhost:8080/job/existing/build", function (err) {
							if (err) return console.log(err);
								console.log('Jenkins file successfully created!!');
						});
					}
				});

		}
		else
		{
			console.log("Files are different! Creating new server...");
			newServer.createServer();
		}
	});
});


var newServer =
{

createServer: function()

		 	{
				AWS.config.update({accessKeyId:'',
			  secretAccessKey: ''});
			AWS.config.update({region: 'us-west-2'});

			var ec2 = new AWS.EC2();

			var params = {
			  ImageId: 'ami-5189a661',
			  InstanceType: 't2.micro',
			  KeyName: 'My AWS Key',
			  MinCount: 1, MaxCount: 1,
			  SecurityGroupIds: ['']
			};

			//delete previous Instance
				fs.readFile('lastInstance', 'utf8', function (err,data) {

					params = {
					  InstanceIds: [
					    data.trim()
					]};

					ec2.terminateInstances(params, function(err, data) {
					  if (err) console.log(err, err.stack); // an error occurred
					  else     console.log("Deleted last instance!");           // successful response
					});
				});

			// Create the instance
			ec2.runInstances(params, function(err, data) {
			  if (err) { console.log("Could not create instance", err); return; }

			  var instanceId = data.Instances[0].InstanceId;
			  //console.log("Created instance", instanceId);

				fs.writeFile('lastInstance', instanceId, function (err) {
					if (err) return console.log(err);
					console.log('Instance file successfully created!!');
				});

			params = {
			  InstanceIds: [
			    instanceId
			]};

				setTimeout(function()
				{

					ec2.describeInstances(params, function(err, data)
					{
					        if (err)
					        {
							console.log(err, err.stack); // an error occurred
						}
						else
						{
						     ipAws = data.Reservations[0].Instances[0].PublicIpAddress;           // successful response
							var dataValue='node0 ansible_ssh_host='+ipAws+' ansible_ssh_user=ubuntu';
							console.log(dataValue);

							var scriptValue = 'ssh -i "My AWS Key.pem" ubuntu@'+ipAws+' \'cd app; npm --version > npmversion\''
														+ '\nscp -i "My AWS Key.pem" ubuntu@'+ipAws+':app/package.json remote/'
														+ '\nscp -i "My AWS Key.pem" ubuntu@'+ipAws+':app/npmversion .'
														+ '\npackcomp package.json remote/package.json > diff'
														+ '\nnode client.js'
														+ '\n./jenkins.sh';

							fs.writeFile('script.sh', scriptValue, function (err) {
								if (err) return console.log(err);
								console.log('Inventory file successfully created!!');
							});

							fs.writeFile('inventory', dataValue, function (err) {
							  if (err) return console.log(err);
							  console.log('Inventory file successfully created!!');
							});

							fs.writeFile('jenkins.sh', "curl http://localhost:8080/job/new_server/build", function (err) {
							  if (err) return console.log(err);
							  	console.log('Jenkins file successfully created!!');
							});


						}

					});


				}, 60000);
			});
}
}
