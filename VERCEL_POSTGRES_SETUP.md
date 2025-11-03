# Vercel Postgres Setup Guide

## 🚀 Quick Setup for Your Security Challenge Arena

### 1. **Add Vercel Postgres to Your Project**

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Security Challenge Arena project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a database name (e.g., `ctf-database`)
7. Select region closest to your users
8. Click **Create**

### 2. **Environment Variables (Auto-Added)**

Vercel automatically adds these environment variables to your project:
- `POSTGRES_URL` - Full connection string
- `POSTGRES_PRISMA_URL` - Prisma-compatible URL
- `POSTGRES_URL_NON_POOLING` - Direct connection
- `POSTGRES_USER` - Database user
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

### 3. **Deploy Your Project**

```bash
git add .
git commit -m "Add Vercel Postgres support"
git push
```

Your app will automatically:
- ✅ **Use SQLite locally** (for development)
- ✅ **Use Postgres on Vercel** (for production)
- ✅ **Create tables automatically** on first run
- ✅ **Migrate existing data** if needed

### 4. **Verify It's Working**

1. Deploy to Vercel
2. Check the function logs in Vercel dashboard
3. Look for: `"Using Vercel Postgres storage"`
4. Test creating teams and leaderboard entries

### 5. **Database Management**

#### **View Data:**
```bash
# Connect to your database
vercel env pull .env.local
psql $POSTGRES_URL
```

#### **Common Queries:**
```sql
-- View all teams
SELECT * FROM teams;

-- View leaderboard
SELECT * FROM leaderboard ORDER BY score DESC;

-- View CTF state
SELECT * FROM ctf_state;
```

#### **Reset Database (if needed):**
```sql
-- Clear all data
DELETE FROM teams WHERE team_name != 'L7ajroot';
DELETE FROM leaderboard;
UPDATE ctf_state SET is_active = TRUE, leaderboard_locked = FALSE;
```

## 🎯 **What You Get**

### **Local Development:**
- ✅ **SQLite database** (`data/ctf.db`)
- ✅ **Full persistence** across restarts
- ✅ **Fast development** experience

### **Vercel Production:**
- ✅ **PostgreSQL database** (managed by Vercel)
- ✅ **True persistence** (no data loss)
- ✅ **Scalable** for many users
- ✅ **Automatic backups**

## 💰 **Pricing**

- **Free Tier**: 60 hours compute/month, 512 MB storage
- **Perfect for CTF events** and competitions
- **Upgrade available** if you need more resources

## 🔧 **Troubleshooting**

### **If Postgres isn't working:**
1. Check environment variables in Vercel dashboard
2. Look at function logs for error messages
3. Verify `POSTGRES_URL` is set correctly

### **If you see "Using fallback storage":**
- This means Postgres isn't available
- Check your Vercel Postgres setup
- Ensure environment variables are properly set

### **Database Connection Issues:**
```bash
# Test connection locally
vercel env pull .env.local
node -e "console.log(process.env.POSTGRES_URL)"
```

## 🎉 **You're All Set!**

Your Security Challenge Arena now has:
- ✅ **Hybrid storage system**
- ✅ **Local SQLite for development**
- ✅ **Vercel Postgres for production**
- ✅ **Automatic environment detection**
- ✅ **No more data loss issues**

Happy CTF hosting! 🚀
