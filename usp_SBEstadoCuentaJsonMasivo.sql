USE [EstadosCuentaJSONProcesador]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[usp_SBEstadoCuentaJsonMasivo]
    @WorkerId INT
AS
BEGIN TRY
    SET NOCOUNT ON;

    -- ══════════════════════════════════════════════════════════════════
    -- VARIABLES
    -- ══════════════════════════════════════════════════════════════════
    DECLARE @FechaCorte DATE;
    DECLARE @BatchSize  INT;

    CREATE TABLE #Lote (
        No_Tarjeta VARCHAR(16) PRIMARY KEY
    );

    -- ── Parámetros de corte y lote ────────────────────────────────────
    SELECT TOP 1 @FechaCorte = FechaCorte
    FROM dbo.ParametrosCorte
    WHERE Estado = 1
    ORDER BY FechaCorte DESC;

    SELECT TOP 1 @BatchSize = RegistrosPorLote
    FROM dbo.ParametrosGeneracionEC;

    -- ══════════════════════════════════════════════════════════════════
    -- RESERVAR LOTE (READPAST evita bloqueos entre workers)
    -- ══════════════════════════════════════════════════════════════════
    INSERT INTO #Lote (No_Tarjeta)
    SELECT TOP (@BatchSize) No_Tarjeta
    FROM dbo.BandejaEstadoCuenta WITH (ROWLOCK, READPAST)
    WHERE Estado = 0
      AND (WorkerId IS NULL OR WorkerId = @WorkerId)
    ORDER BY No_Tarjeta;

    -- Sin registros → retornar señal de fin al worker
    IF NOT EXISTS (SELECT 1 FROM #Lote)
    BEGIN
        SELECT 0 AS Resultado;   -- .NET detecta esta col y corta el loop
        RETURN;
    END

    -- Marcar como "en proceso" por este worker
    UPDATE be
    SET Estado   = 2,
        WorkerId = @WorkerId
    FROM dbo.BandejaEstadoCuenta be
    INNER JOIN #Lote l ON be.No_Tarjeta = l.No_Tarjeta
    WHERE be.Estado = 0;

    -- ══════════════════════════════════════════════════════════════════
    -- RESULT SET 1 — ENCABEZADOS
    -- Un registro por tarjeta, todos los campos planos.
    -- .NET construye el objeto JSON "Encabezado".
    -- ══════════════════════════════════════════════════════════════════
    SELECT
        hc.No_Tarjeta,
        hc.No_Cuenta,

        LTRIM(RTRIM(ISNULL(hc.Origen,         ''))) AS Origen,
        LTRIM(RTRIM(ISNULL(hc.Emisor,         ''))) AS Emisor,
        LTRIM(RTRIM(ISNULL(hc.Nombre_TH_Tit,  ''))) AS Nombre_TH_Tit,
        LTRIM(RTRIM(ISNULL(hc.Emisor_Madre,   ''))) AS Emisor_Madre,
        LTRIM(RTRIM(ISNULL(hc.Cuenta_Madre,   ''))) AS Cuenta_Madre,
        LTRIM(RTRIM(ISNULL(hc.Nombre_Empresa, ''))) AS Nombre_Empresa,
        LTRIM(RTRIM(ISNULL(hc.Tipo_Tarjeta,   ''))) AS Tipo_Tarjeta,

        hc.Fecha_Pago,
        hc.Fecha_Corte,

        ISNULL(hc.Pago_Contado_MN,   0) AS Pago_Contado_MN,
        ISNULL(hc.Pago_Minimo_MN,    0) AS Pago_Minimo_MN,
        ISNULL(hc.Saldo_Vencido_MN,  0) AS Saldo_Vencido_MN,
        ISNULL(hc.Saldo_Anterior_MN, 0) AS Saldo_Anterior_MN,
        ISNULL(hc.Saldo_Final_MN,    0) AS Saldo_Final_MN,
        ISNULL(hc.Compras_Deb_MN,    0) AS Compras_Deb_MN,
        ISNULL(hc.Pagos_Cred_MN,     0) AS Pagos_Cred_MN,
        ISNULL(hc.Sobregiro_MN,      0) AS Sobregiro_MN,
        ISNULL(hc.Cuota_Mes_MN,      0) AS Cuota_Mes_MN,

        ISNULL(hc.Pago_Contado_ME,   0) AS Pago_Contado_ME,
        ISNULL(hc.Pago_Minimo_ME,    0) AS Pago_Minimo_ME,
        ISNULL(hc.Saldo_Vencido_ME,  0) AS Saldo_Vencido_ME,
        ISNULL(hc.Saldo_Anterior_ME, 0) AS Saldo_Anterior_ME,
        ISNULL(hc.Saldo_Final_ME,    0) AS Saldo_Final_ME,
        ISNULL(hc.Compras_Deb_ME,    0) AS Compras_Deb_ME,
        ISNULL(hc.Pagos_Cred_ME,     0) AS Pagos_Cred_ME,
        ISNULL(hc.Sobregiro_ME,      0) AS Sobregiro_ME,
        ISNULL(hc.Cuota_Mes_ME,      0) AS Cuota_Mes_ME,

        -- Saldo consumo: .NET también lo calcula como propiedad computada,
        -- pero lo enviamos por si algún consumidor del RS lo necesita directo.
        ISNULL(hc.Compras_Deb_MN - hc.Interes_Corriente_MN + hc.Saldo_Anterior_MN - hc.Pagos_Cred_MN, 0) AS Saldo_Consumo_MN,
        ISNULL(hc.Compras_Deb_ME - hc.Interes_Corriente_ME + hc.Saldo_Anterior_ME - hc.Pagos_Cred_ME, 0) AS Saldo_Consumo_ME,

        LTRIM(RTRIM(ISNULL(hc.Moneda_Lim_Cre, ''))) AS Moneda_Lim_Cre,
        ISNULL(hc.Limite_Credito,      0) AS Limite_Credito,
        ISNULL(hc.Disponible_Cta_MN,   0) AS Disponible_Cta_MN,
        ISNULL(hc.Disponible_Cta_ME,   0) AS Disponible_Cta_ME,
        ISNULL(hc.Disponible_Ret_MN,   0) AS Disponible_Ret_MN,
        ISNULL(hc.Disponible_Ret_ME,   0) AS Disponible_Ret_ME,

        ISNULL(hc.PTS_Saldo_Ant,    0) AS PTS_Saldo_Ant,
        ISNULL(hc.PTS_Ganados,      0) AS PTS_Ganados,
        ISNULL(hc.PTS_Usuados,      0) AS PTS_Usuados,
        ISNULL(hc.PTS_Saldo_Actual, 0) AS PTS_Saldo_Actual,

        LTRIM(RTRIM(ISNULL(hc.Moneda_Lim_EF, ''))) AS Moneda_Lim_EF,
        ISNULL(hc.EF_Limite,        0) AS EF_Limite,
        ISNULL(hc.EF_Saldo_MN,      0) AS EF_Saldo_MN,
        ISNULL(hc.EF_Debitos_MN,    0) AS EF_Debitos_MN,
        ISNULL(hc.EF_Creditos_MN,   0) AS EF_Creditos_MN,
        ISNULL(hc.EF_Saldo_ME,      0) AS EF_Saldo_ME,
        ISNULL(hc.EF_Debitos_ME,    0) AS EF_Debitos_ME,
        ISNULL(hc.EF_Creditos_ME,   0) AS EF_Creditos_ME,
        ISNULL(hc.EF_Disponible_MN, 0) AS EF_Disponible_MN,
        ISNULL(hc.EF_Disponible_ME, 0) AS EF_Disponible_ME,

        ISNULL(hc.Tasa_Int_Anual_MN, 0) AS Tasa_Int_Anual_MN,
        ISNULL(hc.Tasa_Int_Anual_ME, 0) AS Tasa_Int_Anual_ME,

        LTRIM(RTRIM(ISNULL(hc.Direccion_1, ''))) AS Direccion_1,
        LTRIM(RTRIM(ISNULL(hc.Direccion_2, ''))) AS Direccion_2,
        LTRIM(RTRIM(ISNULL(hc.Direccion_3, ''))) AS Direccion_3,
        LTRIM(RTRIM(ISNULL(hc.Apdo_Postal, ''))) AS Apdo_Postal,
        LTRIM(RTRIM(ISNULL(hc.Cidudad,     ''))) AS Ciudad,          -- alias corrige el typo de la tabla

        LTRIM(RTRIM(ISNULL(CONVERT(VARCHAR(MAX), map.Mensaje), ''))) AS Mensaje_1,
        LTRIM(RTRIM(ISNULL(hc.Mensaje_2, ''))) AS Mensaje_2,
        LTRIM(RTRIM(ISNULL(hc.Mensaje_3, ''))) AS Mensaje_3,
        LTRIM(RTRIM(ISNULL(hc.Mensaje_4, ''))) AS Mensaje_4,
        LTRIM(RTRIM(ISNULL(hc.Mensaje_5, ''))) AS Mensaje_5,

        LTRIM(RTRIM(ISNULL(hc.Tarjeta_Imprimir, ''))) AS Tarjeta_Imprimir,

        ISNULL(hc.Costo_Anual_Tot_MN,  0) AS Costo_Anual_Tot_MN,
        ISNULL(hc.Costo_Anual_Tot_ME,  0) AS Costo_Anual_Tot_ME,

        ISNULL(hc.Plazo_Canc_Deuda_MN, 0) AS Plazo_Canc_Deuda_MN,
        ISNULL(hc.Plazo_Canc_Deuda_ME, 0) AS Plazo_Canc_Deuda_ME,

        ISNULL(hc.Interes_Pago_Min_MN, 0) AS Interes_Pago_Min_MN,
        ISNULL(hc.Interes_Pago_Min_ME, 0) AS Interes_Pago_Min_ME,

        LTRIM(RTRIM(ISNULL(hc.Correo, ''))) AS Correo,

        ISNULL(hc.Limite_CreditoMN,      0) AS Limite_CreditoMN,
        ISNULL(hc.Interes_Corriente_MN,  0) AS Interes_Corriente_MN,
        ISNULL(hc.Interes_Corriente_ME,  0) AS Interes_Corriente_ME,

        LTRIM(RTRIM(ISNULL(t.EstadoTarjeta, '0'))) AS EstadoTarjeta

    FROM #Lote l
    INNER JOIN dbo.BandejaEstadoCuenta be
        ON be.No_Tarjeta = l.No_Tarjeta
    INNER JOIN dbo.BandejaEncabezado hc
        ON hc.No_Tarjeta  = be.No_Tarjeta
       AND hc.Fecha_Corte = @FechaCorte
    LEFT JOIN dbo.CuentasArregloPagos ecap
        ON ecap.NumeroCuenta = hc.NoCuentaClaro
       AND ecap.FechaCorte   = @FechaCorte
    LEFT JOIN HistoricoVASATC.dbo.MensajeArregloPagos map
        ON map.idMensaje = ecap.idMensaje
    LEFT JOIN dbo.Tarjetas t
        ON t.NumeroTarjeta = be.No_Tarjeta;

    -- ══════════════════════════════════════════════════════════════════
    -- RESULT SET 2 — DETALLE DE MOVIMIENTOS
    -- Un registro por movimiento. .NET construye Tipo_Reg, Subtotal y Total.
    -- ══════════════════════════════════════════════════════════════════
    SELECT
        a.EC_DetalleNo_Cuenta AS No_Cuenta,
        a.Fecha_Consumo,
        a.Codigo_Mov,
        LTRIM(RTRIM(ISNULL(a.Descripcion_Mov, ''))) AS Descripcion_Mov,
        LTRIM(RTRIM(ISNULL(a.Moneda_Mov,      ''))) AS Moneda_Mov,       -- "HN" | "DO"
        LTRIM(RTRIM(ISNULL(b.TipoMovimiento,  ''))) AS TipoMovimiento,   -- "D"  | "C"
        ISNULL(a.Monto_Mov, 0)                      AS Monto_Mov

    FROM dbo.BandejaDetalle a
    INNER JOIN dbo.TiposMovimientos b
        ON b.CodMovimiento = a.Codigo_Mov
    -- Solo traer movimientos de las cuentas del lote actual
    INNER JOIN dbo.BandejaEncabezado hc
        ON hc.No_Cuenta   = a.EC_DetalleNo_Cuenta
       AND hc.Fecha_Corte = @FechaCorte
    INNER JOIN #Lote l
        ON l.No_Tarjeta = hc.No_Tarjeta
    WHERE a.Fecha_Corte = @FechaCorte;

    -- ══════════════════════════════════════════════════════════════════
    -- RESULT SET 3 — FINANCIAMIENTOS
    -- Un registro por financiamiento. .NET construye el array JSON.
    -- ══════════════════════════════════════════════════════════════════
    SELECT
        f.NumeroCuenta AS No_Cuenta,
        CASE
            WHEN f.EsIntra = 1 THEN 'Intrafinanciamientos'
            ELSE                    'Extrafinanciamientos'
        END                            AS Tipo,
        f.FechaOtorgamiento,
        ISNULL(f.ImporteTotalPlan,     0) AS ImporteTotalPlan,
        LTRIM(RTRIM(ISNULL(f.MonedaMovimiento, ''))) AS MonedaMovimiento,
        ISNULL(f.Importe,              0) AS Importe,
        ISNULL(f.CantidadCuotasPlan,   0) AS CantidadCuotasPlan,
        ISNULL(f.NoCuotaLiquidada,     0) AS NoCuotaLiquidada,
        ISNULL(f.PlanExtraTasa,        0) AS PlanExtraTasa,        -- .NET formatea "0%" o "X%"
        ISNULL(f.PlanCuotaCapitalPend, 0) AS PlanCuotaCapitalPend

    FROM dbo.BandejaFinanciamientos f
    INNER JOIN dbo.BandejaEncabezado hc
        ON hc.No_Cuenta   = f.NumeroCuenta
       AND hc.Fecha_Corte = @FechaCorte
    INNER JOIN #Lote l
        ON l.No_Tarjeta = hc.No_Tarjeta
    WHERE f.FechaCierre           = @FechaCorte
      AND f.PlanCuotaCapitalPend  > 0
      AND (f.EsIntra = 1 OR f.EsExtra = 1);

    -- ══════════════════════════════════════════════════════════════════
    -- RESULT SET 4 — TARJETAS DEL LOTE
    -- .NET lo usa para logging y confirmación del lote procesado.
    -- ══════════════════════════════════════════════════════════════════
    SELECT No_Tarjeta
    FROM #Lote;

    -- ── Marcar lote como procesado ────────────────────────────────────
    UPDATE be
    SET Estado = 1
    FROM dbo.BandejaEstadoCuenta be
    INNER JOIN #Lote l ON be.No_Tarjeta = l.No_Tarjeta;

END TRY

BEGIN CATCH

    -- Revertir estado para que otro worker pueda reintentar
    UPDATE be
    SET    Estado   = 0,
           WorkerId = NULL
    FROM dbo.BandejaEstadoCuenta be
    INNER JOIN #Lote l ON be.No_Tarjeta = l.No_Tarjeta;

    -- Propagar el error al llamador (.NET lo captura en el catch del worker)
    THROW;

END CATCH
GO
