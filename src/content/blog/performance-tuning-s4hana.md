---
title: "Performance Tuning Techniques in S/4HANA"
date: 2025-10-05
description: "Practical performance optimization techniques for S/4HANA, from HANA pushdown patterns to CDS annotation strategies."
tags: ["SAP", "ABAP", "S4HANA", "Performance", "CDS", "AMDP"]
---

## The Paradigm Shift

S/4HANA changes the performance game entirely. The old ABAP performance rules still apply, but HANA opens up new optimization patterns that were impossible on traditional databases.

## 1. HANA Pushdown – The Golden Rule

Move computation to the database. Every row transferred from DB to application server is a performance cost.

### Before (Application-side processing)

```abap
SELECT vbeln, posnr, matnr, arktx, kwmeng, netpr
  FROM vbap
  INTO TABLE @lt_items
  WHERE vbeln IN @so_vbeln.

LOOP AT lt_items INTO DATA(ls_item).
  ls_item-netwr = ls_item-kwmeng * ls_item-netpr.
  ls_item-waerk = 'USD'.
  MODIFY lt_items FROM ls_item.
ENDLOOP.
```

### After (Database-side processing)

```abap
@AbapCatalog.sqlViewName: 'ZV_SALES_ITEMS'
define view ZI_SalesItems as
  select from vbap
{
  key vbeln,
  key posnr,
  matnr,
  arktx,
  kwmeng,
  netpr,
  kwmeng * netpr as netwr,
  'USD' as waerk
}
```

## 2. Use CDS Annotations Wisely

Annotations drive query optimization in HANA:

```abap
@Analytics.dataCategory: #CUBE
@Analytics.dataExtraction.enabled: true
define view ZI_SalesCube as
  select from vbak
    association [0..*] to vbap as _item
      on vbak.vbeln = _item.vbeln
{
  key vbak.vbeln,
  vbak.kunnr,
  vbak.erdat,
  vbak.netwr,
  count( _item.posnr ) as ItemCount,
  sum( _item.netwr ) as TotalItemValue,
  _item
}
group by
  vbak.vbeln,
  vbak.kunnr,
  vbak.erdat,
  vbak.netwr
```

## 3. AMDP for Complex Logic

When CDS expressions aren't enough, use AMDP with SQLScript:

```abap
METHOD calculate_monthly_totals BY DATABASE PROCEDURE
  FOR HDB LANGUAGE SQLSCRIPT.

  lt_result =
    SELECT
      bukrs,
      gjahr,
      monat,
      SUM( dmbtr ) AS total_amount,
      COUNT(*) AS doc_count
    FROM bsak
    WHERE budat BETWEEN :iv_from AND :iv_to
    GROUP BY bukrs, gjahr, monat
    ORDER BY bukrs, gjahr, monat;

  et_result = SELECT * FROM :lt_result;

ENDMETHOD.
```

## 4. Avoid These Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| `SELECT *` | Transfers unnecessary columns | Select only needed fields |
| `SELECT ... ENDSELECT` | Row-by-row processing | Use `INTO TABLE @DATA()` |
| Nested `LOOP AT ... WHERE` | O(n²) complexity | Use hashed tables or CDS joins |
| `FOR ALL ENTRIES` with empty table | Returns all rows | Check table is not empty first |
| Missing secondary indexes | Full table scans | Use appropriate CDS annotations |

## 5. Use the Right Tools

- **ATC (ABAP Test Cockpit)** – catches performance issues early
- **SQL Monitor** – identifies runtime bottlenecks
- **PlanViz** – visualizes HANA execution plans
- **Runtime Analysis (SAT)** – application-side profiling

## Quick Checklist

- [ ] Are you using `SELECT *` anywhere?
- [ ] Can this logic move to a CDS view?
- [ ] Are internal tables typed correctly (sorted/hashed)?
- [ ] Have you checked the HANA execution plan?
- [ ] Is ATC running on your code with performance checks enabled?

## Final Thought

The biggest performance gains in S/4HANA come from changing *how* you think about data processing, not just optimizing existing code. Push down, aggregate early, and let HANA do what it does best.
