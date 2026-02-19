pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                git 'https://github.com/kammeows/crop_disease_capstone_project.git'
            }
        }

        stage('Build Docker Containers') {
            steps {
                bat 'docker compose down'
                bat 'docker compose build'
                bat 'docker compose up -d'
            }
        }

    }
}
