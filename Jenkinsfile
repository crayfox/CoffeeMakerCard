pipeline {
  agent { label "${env.SLAVE}" }

  stages {

    stage('SCM') {
      steps {
        checkout scm
      }
    }

    stage('SonarQube Analysis') {
      environment {
        scannerHome = tool 'SonarScanner';
      }
      steps {
        script {
          withSonarQubeEnv() {
            sh "${scannerHome}/bin/sonar-scanner"
          }
        }
      }
    }

    stage('Install') {
      steps {
        echo 'Installing dependencies'
        sh 'npm install'
      }
    }

    stage('Test') {
      steps {
        echo 'Testing'
        sh 'cd tests/playwright'
        sh 'npx playwright test custom-card-mock.spec.js'
      }
    }

    stage('Build') {
      steps {
        echo 'Building project'
        sh 'npm run build'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'dist/*.js', fingerprint: true
    }
    success {
      echo 'Pipeline completed successfully'
    }
    failure {
      echo 'Pipeline failed'
    }
  }
}
