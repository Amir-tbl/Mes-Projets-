<?php
// Test de connexion à la base de données
$host = 'localhost';
$db = 'sae_colis';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h1 style='color: green;'>✅ Connexion réussie !</h1>";

    // Compter les utilisateurs
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "<p>Nombre d'utilisateurs : <strong>$count</strong></p>";

    // Lister les utilisateurs
    $stmt = $pdo->query("SELECT nom, prenom, email, role FROM users ORDER BY role");
    echo "<h2>Liste des utilisateurs :</h2><ul style='line-height: 1.8;'>";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<li><strong>{$row['prenom']} {$row['nom']}</strong> ({$row['email']}) - Rôle: <em>{$row['role']}</em></li>";
    }
    echo "</ul>";

    // Compter les fournisseurs
    $stmt = $pdo->query("SELECT COUNT(*) FROM fournisseurs");
    $countFourn = $stmt->fetchColumn();
    echo "<p>Nombre de fournisseurs : <strong>$countFourn</strong></p>";

    // Lister les fournisseurs
    $stmt = $pdo->query("SELECT nom, email, telephone FROM fournisseurs");
    echo "<h2>Liste des fournisseurs :</h2><ul style='line-height: 1.8;'>";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<li><strong>{$row['nom']}</strong> - {$row['email']} - {$row['telephone']}</li>";
    }
    echo "</ul>";

    echo "<hr>";
    echo "<p style='color: green; font-weight: bold;'>🎉 Tout fonctionne parfaitement ! La base de données est bien connectée.</p>";
    echo "<p><a href='agent/index.html'>→ Accéder à l'interface Agent</a></p>";

} catch(PDOException $e) {
    echo "<h1 style='color: red;'>❌ Erreur de connexion</h1>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
    echo "<p>Vérifie que :</p>";
    echo "<ul>";
    echo "<li>MySQL est bien démarré dans Laragon</li>";
    echo "<li>La base de données 'sae_colis' existe bien dans HeidiSQL</li>";
    echo "<li>L'utilisateur est 'root' avec un mot de passe vide</li>";
    echo "</ul>";
}
?>
