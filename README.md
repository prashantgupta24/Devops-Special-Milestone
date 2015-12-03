# Devops-Special-Milestone

    Divya Jain (djain2)
    Shrenik Gala (sngala)
    Prashant Gupta (pgupta7)
    
In the special milestone, we have implemented *Version Monkey*. It compares versions of different softwares that are used by your application and the versions already deployed on the server. If the versions do not match, then the Version Monkey brings down the Server, and creates a new instance. Also, it calles a Jenkings job after that which runs an Ansible playbook on the new instance and configures it with the new changes and the required versions.

For example, here you see that the versions for the Express module are different on the client and the remote. Once the version monkey identifies that, it terminates the existing instance, and brings up a new one, and runs an Ansible playbook on it to configure it with the required versions.

![Image](https://github.com/prashantgupta24/Devops-Special-Milestone/blob/master/special%20milestone.png)

#### Post Commit hook
We ran a script on the post commit hook which took care of all the work for us.

        ssh -i "My AWS Key.pem" ubuntu@52.10.138.95 'cd app; npm --version > npmversion'
        scp -i "My AWS Key.pem" ubuntu@52.10.138.95:app/package.json remote/
        scp -i "My AWS Key.pem" ubuntu@52.10.138.95:app/npmversion .
        packcomp package.json remote/package.json > diff
        node client.js
        ./jenkins.sh

The first 3 lines actually talk to the server, and fetch the NPM version installed on the server as well as the package.json file. The 4th line is a npm module called *packcomp*, which is a handy tool for comparing package.json files. It prepares a document which has the differences in the dependencies of both the package.json files. The *client.js* file reads these changes, and if it identifies that there is a version mismatch in either the NPM version or the package.json dependency version, it triggers a new instance, and creates new Inventory and Jenkins job files. The next line executes the Jenkins job.

#### Playbook for new server

The playbook for the new server is run via Jenkins. It brings the new instance up with the desired changes and the correct versions.

        #---
        - hosts: all
          sudo: yes
          tasks:
          - name: install node
            apt: update_cache=yes name={{ item }} state=present
            with_items:
              - nodejs
              - npm
          - name: Create Directory
            file: path=/home/ubuntu/app state=directory owner=ubuntu group=ubuntu
          - name: copy project files
            copy: src=app.js  dest=/home/ubuntu/app
          - name: copy package json
            copy: src=package.json dest=/home/ubuntu/app
          - name: "Run npm install"
            command: chdir=/home/ubuntu/app npm install

#### Screencast

https://www.youtube.com/watch?v=vUo5vJaRYxk&feature=youtu.be
