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
             ssh ubuntu@172.31.33.36 "
             cd /home/ubuntu/application &&
             docker build -t ecommerce-backend:v1 . &&
             docker stop ecommerce || true &&
             docker rm ecommerce || true &&
             docker run -d --name ecommerce -p 3000:3000 ecommerce-backend:v1
             "
             '''
         }
      }
        
    }
}

