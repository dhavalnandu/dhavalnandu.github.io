---
title: "Performance Tuning Techniques in S/4HANA"
date: 2026-01-20
tags: ["SAP", "S4HANA", "Performance", "ABAP", "CDS"]
excerpt: "Practical performance optimization strategies for S/4HANA systems, including HANA pushdown and code remediation patterns."
---

# Performance Tuning Techniques in S/4HANA

Moving from ECC to S/4HANA isn't just a database migration—it's an opportunity to fundamentally rethink how your ABAP code interacts with the database. Here are the most impactful techniques I've used in production.

## 1. HANA Pushdown Principles

The golden rule: **move computation to the data, not data to the computation.**

### Before (ABAP-side processing)

```abap
SELECT * FROM vbak INTO TABLE @lt_orders
  WHERE erdat IN @s_date.

LOOP AT lt_orders INTO DATA(ls_order).
  SELECT SINGLE name1 FROM kna1
    INTO @ls_order-customer_name
    WHERE kunnr = @ls_order-kunnr.
  MODIFY lt_orders FROM ls_order.
ENDLOOP.
```

### After (Database-side processing)

```abap
SELECT
  v~vbeln,
  v~erdat,
  k~name1 AS customer_name,
  SUM( p~netwr ) AS total_net_value
FROM vbak AS v
  INNER JOIN kna1 AS k ON v~kunnr = k~kunnr
  INNER JOIN vbap AS p ON v~vbeln = p~vbeln
WHERE v~erdat IN @s_date
GROUP BY v~vbeln, v~erdat, k~name1
INTO TABLE @lt_results.
```

## 2. CDS View Optimization

### Use Proper Annotations

```abap
@AbapCatalog.sqlViewName: 'ZVSOHEADER'
@AccessControl.authorizationCheck: #CHECK
@ObjectModel.usageType.serviceQuality: #A
@ObjectModel.usageType.dataClass: #TRANSACTIONAL
@ObjectModel.usageType.sizeCategory: #XXL
define view ZI_SalesOrderHeader as select from vbak
  association [1..1] to kna1 as _customer on $projection.customer = _customer.kunnr
{
  key vbeln as SalesOrder,
      erdat as OrderDate,
      kunnr as Customer,
      netwr as NetValue,
      _customer
}
```

### Key Annotations for Performance

| Annotation | Purpose |
|-----------|---------|
| `@ObjectModel.dataCategory` | Helps optimizer understand data shape |
| `@AccessControl.authorizationCheck` | Pushes auth to database |
| `@Analytics.dataExtraction.enabled` | Enables efficient extraction |
| `@Search.searchable` | Enables HANA full-text search |

## 3. Code Remediation for S/4HANA

During S/4HANA upgrades, the Custom Code Migration app identifies patterns that need attention:

### Deprecated Patterns

```abap
" BAD: SELECT * on large tables
SELECT * FROM bseg INTO TABLE lt_bseg.

" GOOD: Select only needed fields
SELECT bukrs, belnr, gjahr, dmbtr
  FROM bseg
  INTO TABLE @lt_bseg
  WHERE bukrs = @p_bukrs.
```

### HANA-Optimized Patterns

```abap
" Use FOR ALL ENTRIES wisely
IF lt_keys IS NOT INITIAL.
  SELECT * FROM zlarge_table
    INTO TABLE @lt_data
    FOR ALL ENTRIES IN @lt_keys
    WHERE key_field = @lt_keys-key_field.
ENDIF.

" Better: Use JOIN or CDS with proper filtering
```

## 4. ABAP SQL Features for HANA

### String Functions

```abap
SELECT
  CONCAT( name_first, ' ', name_last ) AS full_name,
  UPPER( city ) AS city_upper,
  SUBSTRING( phone, 1, 5 ) AS area_code
FROM but000
INTO TABLE @lt_contacts.
```

### Aggregate Functions

```abap
SELECT
  salesorg,
  COUNT( DISTINCT customer ) AS unique_customers,
  SUM( net_value ) AS total_revenue,
  AVG( margin ) AS avg_margin
FROM zsales_data
GROUP BY salesorg
HAVING SUM( net_value ) > 100000
INTO TABLE @lt_summary.
```

## 5. Runtime Analysis Tools

### Essential T-Codes

- **SAT** – ABAP Runtime Analysis (replaces SE30)
- **ST05** – SQL Trace
- **ADBC_TRACE** – HANA-specific SQL tracing
- **RSDBTRACE** – Database trace at SQL level

### What to Look For

1. **Full table scans** on large tables
2. **Nested SELECTs** in loops
3. **SELECT \*** without field list
4. **Missing indexes** on frequently filtered fields
5. **Data volume** transferred from HANA to ABAP

## 6. Practical Checklist

- [ ] Replace nested SELECTs with JOINs or CDS views
- [ ] Use `SELECT ... INTO TABLE @DATA()` with field lists
- [ ] Leverage CDS annotations for authorization pushdown
- [ ] Replace `SORT` + `DELETE ADJACENT DUPLICATES` with `GROUP BY`
- [ ] Use AMDP for complex calculations that can't be expressed in CDS
- [ ] Review custom code with Custom Code Migration app before upgrade
- [ ] Test with production-like data volumes
- [ ] Monitor with ST05 and SAT after go-live

## Conclusion

Performance tuning in S/4HANA is fundamentally about respecting the column-store architecture. Every line of ABAP that processes data row-by-row is a missed opportunity. The goal isn't just faster code—it's code that works *with* HANA, not against it.
