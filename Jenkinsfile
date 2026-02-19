pipeline {
    agent any

    stages {

        stage('Build Docker Containers') {
            steps {
                bat 'docker compose down'
                bat 'docker compose up --build -d'
            }
        }
        
    }
}
