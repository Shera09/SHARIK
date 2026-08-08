# Backup & Recovery Strategy

## Database Backup Strategy

1. **Automated Point-in-Time Recovery (PITR)**:
   - Supabase automatically captures continuous WAL logs and daily database snapshots.
   - Retains 7-30 days of recovery state depending on plan tier.

2. **Manual Physical / Logical Dump**:
   ```bash
   pg_dump -h db.your-project.supabase.co -U postgres -d postgres -F c -b -v -f crm_backup_$(date +%Y%m%d).dump
   ```

## Restore Procedure
```bash
pg_restore -h db.your-project.supabase.co -U postgres -d postgres -v crm_backup_20260730.dump
```
