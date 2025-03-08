# PWA Marmiton - Documentation

## 1. Introduction

PWA Marmiton est une Progressive Web App (PWA) inspirée de la plateforme de recettes Marmiton. Elle permet aux utilisateurs de créer, modifier, supprimer et consulter des recettes de cuisine. Les utilisateurs peuvent également ajouter des recettes en favoris pour les retrouver plus facilement.

L’application est accessible sans connexion, mais certaines fonctionnalités (ajout/modification de recettes, favoris, commentaires) nécessitent la création d’un compte.

---

## 2. Architecture

### **Front-end**
- React
- Next.js
- Tailwind CSS
- Shadcn/UI

### **Back-end**
- Next.js API Routes
- Prisma ORM
- PostgreSQL

### **Stockage & Déploiement**
- **Stockage d’images** : Supabase
- **Déploiement de la base de données** : Supabase
- **Base de données locale** : PostgreSQL via Docker

### **Gestion des abonnements**
Une table `subscriptions` permet de gérer les abonnements des utilisateurs, notamment pour les cas où un même utilisateur utilise plusieurs appareils.

---

## 3. Fonctionnalités principales

### **Recettes**
Chaque recette contient les informations suivantes :
- Titre
- Description
- Liste d’ingrédients (min. 1)
- Liste d’étapes (min. 1)
- Image (optionnelle)

### **Authentification & Accès**
- L’utilisateur doit être authentifié pour créer/modifier/supprimer des recettes, ajouter des favoris ou commenter.
- Les utilisateurs non connectés peuvent uniquement consulter les recettes.

---

## 4. Service Worker & Stratégies de Cache

Le **Service Worker** est enregistré dès l’arrivée de l’utilisateur sur l’application.

### **Mise en cache & gestion hors ligne**
- **Page d’accueil et détails des recettes** : `stale-while-revalidate`
- **Liste d’ingrédients lors de la création/modification de recette** : `cache-first`
- **Favoris** : `cache-only`
- **Authentification** : `network-only`

Le service worker permet également de gérer la perte de connexion en stockant certaines pages et données pour une consultation hors ligne. Il gère également la synchronisation différée des actions (ajout/suppression de recettes ou commentaires en mode hors ligne).

### **Synchronisation des actions hors ligne**
- Créations et modifications sont stockées en **IndexedDB**.
- Lors du retour en ligne, les actions sont appliquées à la base de données et synchronisées.
- Suppression d’une recette en mode hors ligne : marquée comme "en attente de suppression" et supprimée lors du retour en ligne.
- Les éléments en attente de synchronisation sont indiqués par un message "En attente de synchronisation".

---

## 5. Notifications Push

L’application propose des **notifications push** permettant aux utilisateurs d’être informés de certaines actions (nouvelles recettes, interactions sur leurs recettes, etc.).

### **Fonctionnement**
- L’utilisateur doit activer les notifications via la page **Settings**.
- Une fois activées, une "subscription" est enregistrée dans la base de données avec l’`endpoint` et les clés associées.
- Le service worker écoute l’événement `push` et affiche la notification.

---

## 6. Mécanisme de Mise à Jour

Pour s’assurer que les utilisateurs disposent de la dernière version de l’application, un mécanisme de vérification est en place :

1. Lors du déploiement, Vercel met à jour le fichier `public/version.json` avec l’ID du dernier commit.
2. Toutes les 30 secondes, le service worker vérifie la version actuelle.
3. Si la version a changé, une notification est envoyée à l’utilisateur pour l’informer de la mise à jour.

---

## 7. Retour d’Expérience & Points de Difficulté

- Première expérience dans le développement de PWA, ce qui a permis d’acquérir une compréhension approfondie des mécanismes du cache, du stockage hors ligne et des stratégies de mise à jour.
- Initialement, les Server Actions de Next.js ont été utilisées, mais leur fonctionnement (`POST` vers la racine de l’application) a posé problème dans le développement d’une PWA.

---

## 8. Améliorations & Prochaines Étapes

### **Améliorations déjà apportées**
- Ajout d’un mode clair/sombre synchronisé avec les préférences du système.
- Exploitation des capacités de **SSR** et de **SEO** offertes par Next.js.

### **Prochaines évolutions**
- **Amélioration de la page Settings** : permettre le stockage des préférences en `cache-first` tout en offrant une synchronisation avec le serveur.
- **Système d’abonnement aux ingrédients** : les utilisateurs pourraient recevoir une notification lorsqu’une nouvelle recette contenant un ingrédient favori est ajoutée.
- **Gestion avancée des notifications** : donner aux utilisateurs plus de contrôle sur les notifications qu’ils souhaitent recevoir (ajout de recette, commentaire, like, etc.).

---

## 9. Conclusion

PWA Marmiton démontre comment une Progressive Web App peut offrir une expérience fluide et performante, même en mode hors ligne. Le projet met en avant les bonnes pratiques en matière de **caching**, **stockage local**, **synchronisation différée**, et **notifications push**, tout en exploitant la puissance de Next.js et Prisma.

---

## 10. Technologies utilisées

- **Front-end** : Next.js, React, Tailwind CSS, Shadcn/UI
- **Back-end** : Next.js API Routes, Prisma, PostgreSQL
- **Stockage** : Supabase (images + base de données)
- **Déploiement** : Vercel
- **Gestion hors ligne** : Service Worker, IndexedDB, Cache Storage
- **Notifications** : Web Push API
- **Mise à jour de l’application** : Vérification automatique de la version via Service Worker

---

