<?php
class Mailer {
    private $to;
    private $from;
    private $message;
    private $subject;
    
    public function __construct($to) {
        $this->to = $to;
    }

    public function setFrom($email, $name = '') {
        $this->from = $name ? "$name <$email>" : $email;
        return $this;
    }

    public function setSubject($subject) {
        $this->subject = $subject;
        return $this;
    }

    public function setMessage($message) {
        $this->message = $message;
        return $this;
    }

    public function send() {
        $headers = array(
            'From: ' . $this->from,
            'Reply-To: ' . $this->from,
            'X-Mailer: PHP/' . phpversion(),
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8'
        );

        // Gmail SMTP settings
        ini_set('SMTP', 'smtp.gmail.com');
        ini_set('smtp_port', '587');
        
        // For Gmail, you'll need to use an App Password
        ini_set('smtp_username', 'amineboussetta006@gmail.com');  // Your Gmail address
        ini_set('smtp_password', 'hrpz kvaa otpe aedp');     // Your Gmail App Password
        
        return mail($this->to, $this->subject, $this->message, implode("\r\n", $headers));
    }
}
?>