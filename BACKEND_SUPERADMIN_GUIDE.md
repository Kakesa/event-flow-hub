# Guide d'Implémentation Backend - Super Admin

Ce guide explique comment implémenter le rôle super admin côté backend (Node.js/Express + MongoDB).

## 1. Configuration de l'environnement

### Variables d'environnement (.env)

Ajoutez ces variables à votre fichier `.env`:

```env
# Super Admin Credentials
SUPERADMIN_EMAIL=superadmin@eventflow.com
SUPERADMIN_PASSWORD=SuperAdmin123!
```

> ⚠️ **Important**: Changez ces identifiants en production!

## 2. Script de Seeding du Super Admin

Créez un fichier `scripts/seedSuperAdmin.js`:

```javascript
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Ajustez le chemin selon votre structure

async function seedSuperAdmin() {
  try {
    const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@eventflow.com';
    
    // Vérifier si le super admin existe déjà
    const existingSuperAdmin = await User.findOne({ 
      email: superAdminEmail 
    });
    
    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists');
      return;
    }
    
    // Créer le super admin
    const hashedPassword = await bcrypt.hash(
      process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!', 
      10
    );
    
    const superAdmin = await User.create({
      name: 'Super Administrator',
      email: superAdminEmail,
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      subscriptionType: 'enterprise',
      permissions: [
        { module: 'events', create: true, read: true, update: true, delete: true },
        { module: 'guests', create: true, read: true, update: true, delete: true },
        { module: 'invitations', create: true, read: true, update: true, delete: true },
        { module: 'guestbook', create: true, read: true, update: true, delete: true },
        { module: 'analytics', create: true, read: true, update: true, delete: true },
        { module: 'users', create: true, read: true, update: true, delete: true },
        { module: 'settings', create: true, read: true, update: true, delete: true },
      ],
    });
    
    console.log('✅ Super admin created successfully:', superAdmin.email);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  }
}

module.exports = seedSuperAdmin;
```

## 3. Appeler le Script au Démarrage du Serveur

Dans votre fichier `server.js` ou `app.js`:

```javascript
const seedSuperAdmin = require('./scripts/seedSuperAdmin');

// ... autres configurations ...

async function startServer() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    
    // ✨ Créer le super admin si nécessaire
    await seedSuperAdmin();
    
    // Démarrer le serveur
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer();
```

## 4. Middleware d'Authentification Super Admin

Créez ou mettez à jour votre middleware `auth.middleware.js`:

```javascript
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Accès refusé. Privilèges super admin requis.' 
  });
};

const isSuperAdminOrOwner = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    // Super admin peut accéder à toutes les ressources
    return next();
  }
  
  // Vérifier si l'utilisateur est le propriétaire de la ressource
  // (logique à adapter selon votre modèle)
  next();
};

module.exports = { isSuperAdmin, isSuperAdminOrOwner };
```

## 5. Routes pour le Super Admin

### Route : Récupérer tous les événements

Dans `routes/events.routes.js`:

```javascript
const { isSuperAdmin } = require('../middleware/auth.middleware');

// GET /api/events/all - Super admin only
router.get('/all', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements',
      error: error.message,
    });
  }
});
```

### Route : Récupérer tous les admins

Dans `routes/auth.routes.js` ou `routes/users.routes.js`:

```javascript
const { isSuperAdmin } = require('../middleware/auth.middleware');

// GET /api/auth/users/admins - Super admin only
router.get('/users/admins', authenticateToken, isSuperAdmin, async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ['admin', 'superadmin'] }
    }).select('-password');
    
    res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des admins',
      error: error.message,
    });
  }
});
```

## 6. Modifier les Routes Existantes

Pour permettre au super admin d'accéder aux ressources des autres utilisateurs, modifiez vos contrôleurs:

### Exemple : Controller d'événements

```javascript
// events.controller.js
const getEvents = async (req, res) => {
  try {
    let query = {};
    
    // Si ce n'est pas un super admin, filtrer par userId
    if (req.user.role !== 'superadmin') {
      query.userId = req.user._id;
    }
    
    const events = await Event.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements',
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé',
      });
    }
    
    // Vérifier les permissions
    if (req.user.role !== 'superadmin' && event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      });
    }
    
    // Mettre à jour l'événement
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
    });
  }
};
```

## 7. Modèle User (si nécessaire)

Assurez-vous que votre modèle `User` supporte le rôle `superadmin`:

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'organizer', 'superadmin'],
    default: 'user',
  },
  isActive: { type: Boolean, default: true },
  subscriptionType: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free',
  },
  permissions: [{
    module: String,
    create: Boolean,
    read: Boolean,
    update: Boolean,
    delete: Boolean,
  }],
}, { timestamps: true });
```

## 8. Test de l'Implémentation

### 1. Démarrer le serveur
```bash
npm start
```

Vérifiez dans les logs:
```
✅ MongoDB connected
✅ Super admin created successfully: superadmin@eventflow.com
🚀 Server running on port 5000
```

### 2. Se connecter en tant que super admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@eventflow.com",
    "password": "SuperAdmin123!"
  }'
```

### 3. Tester l'accès aux événements

```bash
curl -X GET http://localhost:5000/api/events/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 9. Sécurité

### Bonnes pratiques:

1. **Changez les identifiants par défaut** en production
2. **Utilisez des mots de passe forts** (minimum 12 caractères)
3. **Limitez le nombre de super admins** (idéalement 1-2 maximum)
4. **Loggez toutes les actions** des super admins pour audit
5. **Activez l'authentification à deux facteurs** si possible
6. **Restreignez l'accès IP** si l'environnement le permet

### Exemple de logging des actions super admin:

```javascript
const logSuperAdminAction = async (req, action, resourceType, resourceId) => {
  if (req.user.role === 'superadmin') {
    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action,
      resourceType,
      resourceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    });
  }
};

// Utilisation dans un contrôleur:
router.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    
    // Log si super admin
    await logSuperAdminAction(req, 'DELETE', 'Event', req.params.id);
    
    res.json({ success: true, message: 'Événement supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

## 10. Troubleshooting

### Le super admin n'est pas créé
- Vérifiez la connexion à MongoDB
- Vérifiez les variables d'environnement
- Consultez les logs du serveur

### Erreur "Accès refusé"
- Vérifiez que le token JWT contient bien `role: 'superadmin'`
- Vérifiez que le middleware `isSuperAdmin` est bien appliqué

### Le super admin ne peut pas voir tous les événements
- Vérifiez que la route `/api/events/all` existe
- Vérifiez les permissions dans le contrôleur
- Testez avec Postman ou curl

## Résumé

✅ Variables d'environnement configurées
✅ Script de seeding créé
✅ Super admin créé au démarrage
✅ Middlewares d'authentification mis à jour
✅ Routes super admin créées
✅ Contrôleurs modifiés pour gérer le super admin
✅ Tests effectués
✅ Sécurité renforcée

Le super admin est maintenant opérationnel et peut gérer tous les événements de tous les utilisateurs!
