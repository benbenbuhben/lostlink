# Docker Database Persistence Guide

## ✅ Current Status

Your Docker volumes are **properly configured** and data **should persist** across container restarts.

**Volumes:**
- `lostlink_mongo-data` - MongoDB data storage
- `lostlink_minio-data` - MinIO image storage

**Location:** `/var/lib/docker/volumes/lostlink_mongo-data/_data`

---

## ⚠️ Why Data Might Disappear

### 1. **Using `docker-compose down -v`**
This command **deletes volumes** and all data!

```bash
# ❌ DON'T USE THIS - Deletes all data
docker-compose down -v

# ✅ USE THIS INSTEAD - Keeps data
docker-compose down
docker-compose up -d
```

### 2. **Container Rebuild**
If you rebuild containers, data should persist, but check volume mounts.

### 3. **Volume Not Mounted**
Check if volume is properly mounted:
```bash
docker inspect lostlink-mongo | grep -A 10 "Mounts"
```

---

## 🔧 How to Keep Data Safe

### Safe Commands:
```bash
# Restart containers (keeps data)
docker-compose restart

# Stop containers (keeps data)
docker-compose stop

# Start containers (keeps data)
docker-compose start

# Recreate containers (keeps data)
docker-compose up -d --force-recreate
```

### Dangerous Commands:
```bash
# ❌ Deletes volumes and all data
docker-compose down -v

# ❌ Deletes specific volume
docker volume rm lostlink_mongo-data
```

---

## 🧪 Test Data Persistence

1. **Create test item:**
   - Add an item through the app
   - Note the item ID

2. **Restart containers:**
   ```bash
   docker-compose restart
   ```

3. **Check if item still exists:**
   - Item should still be in the feed
   - If not, volume might not be mounted correctly

---

## 🔍 Verify Volume Mount

```bash
# Check if volume exists
docker volume ls | grep lostlink

# Check volume details
docker volume inspect lostlink_mongo-data

# Check container mounts
docker inspect lostlink-mongo | grep -A 5 "Mounts"
```

---

## 💾 Backup Data (Optional)

If you want to backup your data:

```bash
# Backup MongoDB
docker exec lostlink-mongo mongodump --out /data/backup

# Copy backup to host
docker cp lostlink-mongo:/data/backup ./mongo-backup
```

---

## 🚨 If Data Keeps Disappearing

1. **Check volume mount:**
   ```bash
   docker inspect lostlink-mongo
   ```

2. **Verify docker-compose.yml:**
   - Ensure `volumes:` section exists for mongo service
   - Should have: `- mongo-data:/data/db`

3. **Check for volume conflicts:**
   - Multiple docker-compose files might create conflicts
   - Use named volumes (current setup is correct)

---

## Summary

✅ **Your setup is correct** - volumes are configured properly
⚠️ **Be careful with `-v` flag** - it deletes everything
💡 **Use `restart` instead of `down`** for daily development

