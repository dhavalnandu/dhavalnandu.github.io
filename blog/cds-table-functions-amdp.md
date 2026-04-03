---
title: "When to Use CDS Table Functions with AMDP"
date: 2026-02-28
tags: ["SAP", "CDS", "AMDP", "S4HANA", "Performance"]
excerpt: "Understanding the sweet spot for combining CDS Table Functions with AMDP methods for complex HANA-side logic."
---

# When to Use CDS Table Functions with AMDP

CDS Table Functions backed by AMDP (ABAP Managed Database Procedures) are one of the most powerful—but often misunderstood—features in the S/4HANA developer toolkit.

## What Are CDS Table Functions?

A CDS Table Function is a special CDS entity that returns its data from an AMDP method rather than a standard CDS SELECT. This allows you to write SQLScript directly while still exposing the result as a CDS entity.

```abap
@EndUserText.label: 'Sales Order Analytics'
define table function ZTF_SO_Analytics
{
  key SalesOrder  : /dmo/sales_order_id;
      Customer    : /dmo/customer_id;
      TotalAmount : /dmo/total_gross_amount;
      ItemCount   : abap.int4;
      AvgDiscount : abap.dec(5,2);
}
implemented by method zcl_amdp_so_analytics=>get_data;
```

## The AMDP Implementation

```abap
CLASS zcl_amdp_so_analytics DEFINITION
  PUBLIC FINAL CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.

    CLASS-METHODS get_data
      FOR TABLE FUNCTION ztf_so_analytics.
ENDCLASS.

CLASS zcl_amdp_so_analytics IMPLEMENTATION.
  METHOD get_data BY DATABASE FUNCTION
    FOR HDB LANGUAGE SQLSCRIPT
    OPTIONS READ-ONLY
    USING zso_header zso_item.

    RETURN
      SELECT
        so.sales_order  AS SalesOrder,
        so.customer_id  AS Customer,
        SUM(item.gross) AS TotalAmount,
        COUNT(*)        AS ItemCount,
        AVG(item.disc)  AS AvgDiscount
      FROM zso_header AS so
      INNER JOIN zso_item AS item
        ON so.sales_order = item.sales_order
      GROUP BY
        so.sales_order,
        so.customer_id;
  ENDMETHOD.
ENDCLASS.
```

## When Table Functions Are the Right Choice

### 1. Complex Aggregations

When your logic requires:

- Multiple levels of aggregation
- Window functions (`ROW_NUMBER`, `RANK`, `LAG`)
- Recursive queries
- Complex joins that CDS can't express cleanly

### 2. HANA-Specific Functions

When you need:

- Graph workspace operations
- Text search with fuzzy matching
- Spatial calculations
- Predictive analysis library (PAL) calls

### 3. Performance-Critical Scenarios

When:

- The calculation is too expensive for ABAP-side processing
- You need to minimize data transfer between ABAP and HANA
- Standard CDS views generate suboptimal SQL

## When NOT to Use Table Functions

### Prefer Standard CDS When:

- Simple joins and associations suffice
- You need annotations for Fiori Elements
- You want the framework to handle authorization (DCL)
- The logic is straightforward SELECT with filters

### Important Limitations

- **No CDS annotations** – Table Functions cannot carry UI annotations
- **No DCL integration** – Authorization must be handled in SQLScript
- **No associations** – Cannot define CDS associations on table functions
- **Debugging complexity** – SQLScript debugging is harder than ABAP

## Performance Considerations

```sql
-- Good: Push computation to HANA
SELECT
  customer_id,
  SUM(gross_amount) AS total,
  COUNT(DISTINCT sales_order) AS order_count
FROM zso_header
WHERE posting_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY customer_id;

-- Bad: Fetch everything and process in ABAP
SELECT * FROM zso_header
  WHERE posting_date BETWEEN '2024-01-01' AND '2024-12-31'.
" Then loop and aggregate in ABAP - DON'T DO THIS
```

## Best Practices

1. **Keep SQLScript focused** – Don't replicate entire business logic in AMDP
2. **Use table functions as a last resort** – Standard CDS is preferred when possible
3. **Document the why** – Future maintainers need to understand why AMDP was chosen
4. **Test with EXPLAIN PLAN** – Verify the query execution plan is optimal
5. **Handle nulls explicitly** – SQLScript null handling differs from ABAP

## Conclusion

CDS Table Functions with AMDP fill an important gap between pure CDS views and full custom ABAP logic. Use them when the computation genuinely belongs on the database side and can't be expressed in standard CDS. But resist the temptation to overuse them—standard CDS views with proper annotations are almost always the better starting point.
