---
title: "RAP vs Classical ABAP – Practical Comparison"
date: 2026-03-15
tags: ["SAP", "ABAP", "RAP", "S4HANA"]
excerpt: "A hands-on comparison of the RESTful Application Programming Model versus classical ABAP development."
---

# RAP vs Classical ABAP – Practical Comparison

After spending the last two years building S/4HANA applications with the RESTful Application Programming Model (RAP), I wanted to share a practical comparison with classical ABAP development approaches.

## What is RAP?

RAP is SAP's modern programming model for building transactional apps on S/4HANA. It combines:

- **CDS Views** for the data model
- **Behavior Definitions** for business logic
- **Service Bindings** for OData exposure
- **ABAP RESTful Application Programming Model** runtime

## Classical ABAP Approach

In the classical approach, a typical CRUD application required:

- SEGW (SAP Gateway) project for OData services
- DPC/MPC classes with manual method implementations
- BOPF or custom BO frameworks
- Separate UI5/Fiori app development

```abap
" Classical approach - manual DPC_EXT implementation
METHOD /iwbep/if_mgw_appl_srv_runtime~get_entityset.
  CASE iv_entity_set_name.
    WHEN 'SalesOrders'.
      SELECT * FROM vbak INTO TABLE @lt_orders
        UP TO @is_paging-top ROWS
        OFFSET @is_paging-skip.
      " Manual mapping, filtering, pagination
  ENDCASE.
ENDMETHOD.
```

## RAP Approach

With RAP, the same functionality becomes declarative:

```abap
" CDS View Entity with RAP annotations
@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
define root entity ZI_SalesOrder
{
  key SalesOrder : /dmo/sales_order_id;
      Buyer      : /dmo/buyer_id;
      GrossAmount: /dmo/total_gross_amount;

  // Associations
  _Items : composition [0..*] of ZI_SalesOrderItem on _Items.SalesOrder = SalesOrder;
}
```

```abap
" Behavior Definition
managed; // or unmanaged

define behavior for ZI_SalesOrder
{
  create;
  update;
  delete;

  association _Items { create; }

  mapping for ZS_SalesOrder corresponding;
}
```

## Key Differences

| Aspect | Classical ABAP | RAP |
|--------|---------------|-----|
| OData Generation | Manual SEGW | Automatic from CDS |
| Business Logic | DPC_EXT methods | Behavior Pool (BDEF) |
| Data Model | DDIC Tables | CDS View Entities |
| Transactions | Custom handling | EML + Save Sequence |
| Draft Support | Custom implementation | Built-in |
| Authorization | Manual checks | DCL (Data Control Language) |

## When to Use Each

### Use RAP When:

- Building new S/4HANA applications from scratch
- You need Fiori Elements UI (list reports, object pages)
- Draft-enabled editing is required
- You want automatic OData service generation

### Classical ABAP Still Makes Sense For:

- Extending existing SEGW-based services
- Complex scenarios not yet supported by RAP
- ECC systems without RAP framework
- Legacy system integrations

## Migration Considerations

If you're moving from classical ABAP to RAP:

1. **Start with the data model** – redesign using CDS view entities
2. **Define behavior** – map existing logic to BDEF actions
3. **Use EML** – replace direct DB operations with Entity Manipulation Language
4. **Leverage draft** – RAP's draft handling is a significant improvement
5. **Test with ADT** – Eclipse-based development is essential

## Conclusion

RAP represents a fundamental shift in how we build SAP applications. While the learning curve is real, the productivity gains—especially for standard CRUD scenarios—are substantial. For new S/4HANA projects, RAP should be the default choice.

The key is understanding that RAP is not just a new syntax—it's a different architectural paradigm that pushes more logic to the HANA database and relies on framework-managed transactions.
