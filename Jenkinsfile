pipeline {
    agent any

    stages {

        stage('Build Docker Containers') {
            steps {
                bat 'docker compose down'
                bat 'docker compose build'
                bat 'docker compose up -d'
            }
        }

    }
}
