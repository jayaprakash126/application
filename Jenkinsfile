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
    }
}
