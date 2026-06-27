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
    }
}
