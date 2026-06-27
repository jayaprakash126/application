pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Verify Node') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'

                    withSonarQubeEnv('sonarqube') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=ecommerce-luxe \
                        -Dsonar.projectName=ecommerce-luxe \
                        -Dsonar.sources=. \
                        -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }
        stage('Deploy to Docker Server') {
    steps {
        sh '''
        ssh ubuntu@172.31.33.36 '
        cd ~/deployments

        if [ ! -d application ]; then
            git clone https://github.com/jayaprakash126/application.git
        fi

        cd application

        git pull origin main

        docker stop ecommerce || true
        docker rm ecommerce || true
        docker rmi ecommerce-backend:v1 || true

        docker build -t ecommerce-backend:v1 .

        docker run -d \
          --name ecommerce \
          -p 3000:3000 \
          ecommerce-backend:v1
        '
        '''
    }
}
        
    }
}

