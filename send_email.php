<?php
if($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data with proper checks
    $name = isset($_POST['name']) ? htmlspecialchars($_POST['name']) : '';
    $email = isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : '';
    $message = isset($_POST['message']) ? htmlspecialchars($_POST['message']) : '';

    // Gmail SMTP settings
    $smtpServer = "smtp.gmail.com";
    $smtpPort = 587;
    $gmailUsername = "amineboussetta006@gmail.com"; // Your Gmail address
    $gmailPassword = "hrpz kvaa otpe aedp";     // Your Gmail App Password
    $recipientEmail = "amineboussetta006@gmail.com";

    // Create message
    $emailBody = "Nom: $name\n";
    $emailBody .= "Courriel: $email\n";
    $emailBody .= "Téléphone: $phone\n";
    $emailBody .= "Message:\n$message\n";

    // Create socket connection
    $socket = fsockopen("tls://".$smtpServer, $smtpPort, $errno, $errstr, 30);

    if (!$socket) {
        echo json_encode(['status' => 'error', 'message' => "Connection failed: $errstr ($errno)"]);
        exit();
    }

    // Connection successful, start SMTP conversation
    $response = fgets($socket, 515);
    
    // Send EHLO command
    fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
    $response = fgets($socket, 515);

    // Start TLS
    fputs($socket, "STARTTLS\r\n");
    $response = fgets($socket, 515);
    
    // Upgrade to TLS
    stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
    
    // Send EHLO again after TLS
    fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
    $response = fgets($socket, 515);
    
    // Authenticate
    fputs($socket, "AUTH LOGIN\r\n");
    $response = fgets($socket, 515);
    fputs($socket, base64_encode($gmailUsername) . "\r\n");
    $response = fgets($socket, 515);
    fputs($socket, base64_encode($gmailPassword) . "\r\n");
    $response = fgets($socket, 515);
    
    // Send email
    fputs($socket, "MAIL FROM:<$gmailUsername>\r\n");
    $response = fgets($socket, 515);
    fputs($socket, "RCPT TO:<$recipientEmail>\r\n");
    $response = fgets($socket, 515);
    fputs($socket, "DATA\r\n");
    $response = fgets($socket, 515);
    
    // Send headers and body
    $headers = "From: $name <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Subject: New Contact Form Submission\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    fputs($socket, $headers . "\r\n" . $emailBody . "\r\n.\r\n");
    $response = fgets($socket, 515);
    
    // Close connection
    fputs($socket, "QUIT\r\n");
    fclose($socket);
    
    echo json_encode(['status' => 'success', 'message' => 'Message envoyé avec succès']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Methode de requete non supportée']);
}
?>