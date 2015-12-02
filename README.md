# Devops-Special-Milestone

    Divya Jain (djain2)
    Shrenik Gala (sngala)
    Prashant Gupta (pgupta7)
    
In the special milestone, we have implemented *Version Monkey*. What this does is that it compares versions of different softwares that are used by your application and the versions already deployed on the server. If the versions do not match, then the Version Monkey brings down the Server, and creates a new instance. Also, it calles a Jenkings job after that which runs an Ansible playbook on the new instance and configures it with the new changes and the required versions.
