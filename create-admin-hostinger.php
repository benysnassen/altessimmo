<?php
// Script pour créer l'admin sur Hostinger MySQL
require_once 'vendor/autoload.php';

// Configuration Hostinger
$host = 'localhost'; // ou l'IP de votre base Hostinger
$dbname = 'votre_nom_de_base';
$username = 'votre_utilisateur_mysql';
$password = 'votre_mot_de_passe_mysql';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Mot de passe : Admin123!@$ (haché avec bcrypt)
    $hashedPassword = '$2b$12$vdAMTNi/WOz.8DJMubL7seEXLGmXhibvGELRDsCsk75JzA7UFsryK';
    
    // Créer l'admin
    $sql = "INSERT INTO admins (id, username, password, email, lastLogin, isActive, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        'cmgp6qnmg00007rqiqzwv2a1k', // ID unique
        'byzen',                      // Nom d'utilisateur
        $hashedPassword,              // Mot de passe haché
        'admin@altessimmo.com',       // Email
        date('Y-m-d H:i:s'),          // Dernière connexion
        1,                            // Actif
        date('Y-m-d H:i:s'),          // Date de création
        date('Y-m-d H:i:s')           // Date de mise à jour
    ]);
    
    if ($result) {
        echo "✅ Admin 'byzen' créé avec succès dans MySQL Hostinger !\n";
        echo "Nom d'utilisateur: byzen\n";
        echo "Mot de passe: Admin123!@$\n";
    } else {
        echo "❌ Erreur lors de la création de l'admin\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Erreur de connexion: " . $e->getMessage() . "\n";
}
?>


