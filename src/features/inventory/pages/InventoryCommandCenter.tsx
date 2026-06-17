import { useEffect, useMemo, useState } from 'react'
import { Boxes, ClipboardCheck, History, PackagePlus, ShoppingCart, TriangleAlert } from 'lucide-react'
import { DataTable, type Column } from '../../../components/DataTable'
import { Drawer } from '../../../components/Drawer'
import { Input } from '../../../components/Input'
import { PageHeader } from '../../../components/PageHeader'
import { Select } from '../../../components/Select'
import { StatusHighlighter } from '../../../components/StatusHighlighter'
import { hasPermissionAccess } from '../../../lib/access'
import { useAuthStore } from '../../../store/authStore'
import { useUnits } from '../../master/hooks/useUnit'
import {
    useApproveInventoryStockIssueRequest,
    useCreateInventoryProduct,
    useCreateInventoryPurchase,
    useCreateInventoryStockIssueRequest,
    useInventoryProducts,
    useInventoryPurchases,
    useInventoryStock,
    useInventoryStockIssueRequests,
    useInventoryStockMovements,
    useRejectInventoryStockIssueRequest,
    useUpdateInventoryStock
} from '../hooks/useInventory'
import type { InventoryPurchase, InventoryStock, InventoryStockIssueRequest, InventoryStockMovement } from '../types'
import { getDefaultInventoryScope, getInventoryScopeLabel, inventoryScopeOptions, issueInScope, movementInScope, normalizeInventoryCategory, productInScope, purchaseInScope, stockInScope, type InventoryScope } from '../utils/inventoryScope'

const lowStockThreshold = 10
const tabs = ['Overview', 'Products', 'Stock', 'Issues', 'Movements', 'Purchases', 'Low Stock'] as const
type InventoryTab = typeof tabs[number]

const movementLabel: Record<InventoryStockMovement['movementType'], string> = {
    STOCK_IN: 'Stock In',
    STOCK_OUT: 'Stock Out',
    PURCHASE: 'Purchase',
    CURRENT_STOCK: 'Current Stock'
}

const money = (value: number) => `Rs ${Number(value || 0).toFixed(2)}`
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString('en-GB') : '-'

export function InventoryCommandCenter() {
    const user = useAuthStore((state) => state.user)
    const activeUnitId = useAuthStore((state) => state.activeUnitId || state.user?.unitId || '')
    const canReadAllUnits = Boolean(user?.unitAccess?.includes('*') || user?.permissions?.includes('ALL_ACCESS'))
    const [activeTab, setActiveTab] = useState<InventoryTab>('Overview')
    const [inventoryScope, setInventoryScope] = useState<InventoryScope>(() => getDefaultInventoryScope(user))
    const [unitScope, setUnitScope] = useState(() => canReadAllUnits ? 'all' : activeUnitId)
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [drawer, setDrawer] = useState<'product' | 'stock' | 'issue' | 'purchase' | null>(null)
    const [productForm, setProductForm] = useState({ name: '', category: '', unit: 'Nos', defaultRevenuePrice: '', chargeableInCareRevenue: false, status: true })
    const [stockForm, setStockForm] = useState({ productId: '', mode: 'IN', quantity: '', issuedTo: '', usageType: 'Stock Receipt', notes: '' })
    const [issueForm, setIssueForm] = useState({ productId: '', quantity: '', usageType: 'PATIENT_CARE', issuedTo: '', notes: '' })
    const [purchaseForm, setPurchaseForm] = useState({ productId: '', vendor: '', quantity: '' })

    const { data: units = [] } = useUnits()
    const readOptions = useMemo(() => {
        if (canReadAllUnits && unitScope === 'all') return { scope: 'all' as const }
        const selectedUnitId = unitScope || activeUnitId || user?.unitId || null
        return selectedUnitId ? { unitId: selectedUnitId } : undefined
    }, [activeUnitId, canReadAllUnits, unitScope, user?.unitId])
    const { data: products = [], isLoading: productsLoading } = useInventoryProducts(readOptions)
    const { data: stock = [], isLoading: stockLoading } = useInventoryStock(readOptions)
    const { data: issues = [], isLoading: issuesLoading } = useInventoryStockIssueRequests(readOptions)
    const { data: movements = [], isLoading: movementsLoading } = useInventoryStockMovements(readOptions)
    const { data: purchases = [], isLoading: purchasesLoading } = useInventoryPurchases(readOptions)
    const createProduct = useCreateInventoryProduct()
    const updateStock = useUpdateInventoryStock()
    const createIssue = useCreateInventoryStockIssueRequest()
    const approveIssue = useApproveInventoryStockIssueRequest()
    const rejectIssue = useRejectInventoryStockIssueRequest()
    const createPurchase = useCreateInventoryPurchase()

    const canRequestIssue = hasPermissionAccess(user, ['Stock Issue Request'])
    const canApproveIssue = hasPermissionAccess(user, ['Stock Issue Approval'])

    useEffect(() => {
        if (canReadAllUnits && !unitScope) setUnitScope('all')
        if (!canReadAllUnits && unitScope !== activeUnitId) setUnitScope(activeUnitId)
    }, [activeUnitId, canReadAllUnits, unitScope])

    const unitLabelById = useMemo(() => new Map(units.map((unit) => [unit.id, unit.shortName || unit.unitId || unit.name])), [units])
    const unitOptions = useMemo(() => {
        const options = units
            .filter((unit) => unit.status !== 'inactive')
            .map((unit) => ({ value: unit.id, label: unit.shortName || unit.unitId || unit.name }))
        return canReadAllUnits ? [{ value: 'all', label: 'All Units' }, ...options] : options
    }, [canReadAllUnits, units])

    const scopedProducts = useMemo(() => products.filter((item) => productInScope(item, inventoryScope)), [inventoryScope, products])
    const categoryOptions = useMemo(() => {
        const categories = Array.from(new Set(scopedProducts.map((item) => normalizeInventoryCategory(item.category)).filter(Boolean))).sort()
        return [{ value: 'all', label: 'All Categories' }, ...categories.map((category) => ({ value: category, label: category.replace(/-/g, ' ') }))]
    }, [scopedProducts])
    const selectedCategoryProducts = useMemo(() => (
        scopedProducts.filter((item) => categoryFilter === 'all' || normalizeInventoryCategory(item.category) === categoryFilter)
    ), [categoryFilter, scopedProducts])
    const selectedProductIds = useMemo(() => new Set(selectedCategoryProducts.map((item) => item.id)), [selectedCategoryProducts])
    const scopedStock = useMemo(() => stock.filter((item) => stockInScope(item, inventoryScope) && selectedProductIds.has(item.productId)), [inventoryScope, selectedProductIds, stock])
    const scopedIssues = useMemo(() => issues.filter((item) => issueInScope(item, inventoryScope) && selectedProductIds.has(item.productId)), [inventoryScope, issues, selectedProductIds])
    const scopedMovements = useMemo(() => movements.filter((item) => movementInScope(item, inventoryScope) && selectedProductIds.has(item.productId)), [inventoryScope, movements, selectedProductIds])
    const scopedPurchases = useMemo(() => purchases.filter((item) => purchaseInScope(item, inventoryScope) && selectedProductIds.has(item.productId)), [inventoryScope, purchases, selectedProductIds])
    const stockByProductId = useMemo(() => new Map(stock.map((item) => [item.productId, item])), [stock])
    const writeProductOptions = selectedCategoryProducts
        .filter((product) => !activeUnitId || product.unitId === activeUnitId)
        .map((product) => ({ value: product.id, label: `${product.name} (${product.category})${unitScope === 'all' ? ` - ${unitLabelById.get(product.unitId) || product.unitId}` : ''}` }))
    const query = searchQuery.trim().toLowerCase()

    const visibleStock = scopedStock.filter((item) => !query || [item.product?.name, item.product?.category, item.quantity].some((value) => String(value || '').toLowerCase().includes(query)))
    const visibleIssues = scopedIssues.filter((item) => !query || [item.productName, item.category, item.usageType, item.status, item.issuedTo, item.notes].some((value) => String(value || '').toLowerCase().includes(query)))
    const visibleMovements = scopedMovements.filter((item) => !query || [item.product?.name, item.product?.category, item.usageType, item.issuedTo, item.vendor, item.notes, item.updatedBy].some((value) => String(value || '').toLowerCase().includes(query)))
    const visiblePurchases = scopedPurchases.filter((item) => !query || [item.product?.name, item.product?.category, item.vendor, item.quantity].some((value) => String(value || '').toLowerCase().includes(query)))
    const lowStockRows = visibleStock.filter((item) => Number(item.quantity || 0) <= lowStockThreshold)

    const summary = {
        products: selectedCategoryProducts.length,
        stock: scopedStock.length,
        low: scopedStock.filter((item) => Number(item.quantity || 0) <= lowStockThreshold).length,
        issues: scopedIssues.filter((item) => item.status === 'PENDING').length,
        purchases: scopedPurchases.length,
        movements: scopedMovements.length
    }
    const metricCards = [
        { label: 'Products', value: summary.products, Icon: Boxes },
        { label: 'Stock Records', value: summary.stock, Icon: ClipboardCheck },
        { label: 'Low Stock', value: summary.low, Icon: TriangleAlert },
        { label: 'Pending Issues', value: summary.issues, Icon: ClipboardCheck },
        { label: 'Purchases', value: summary.purchases, Icon: ShoppingCart },
        { label: 'Movements', value: summary.movements, Icon: History }
    ]

    const submitProduct = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!productForm.name.trim() || !productForm.category.trim()) return
        await createProduct.mutateAsync({
            name: productForm.name.trim(),
            category: productForm.category.trim(),
            unit: productForm.unit.trim() || 'Nos',
            defaultRevenuePrice: Number(productForm.defaultRevenuePrice || 0),
            chargeableInCareRevenue: productForm.chargeableInCareRevenue,
            status: productForm.status
        })
        setProductForm({ name: '', category: '', unit: 'Nos', defaultRevenuePrice: '', chargeableInCareRevenue: false, status: true })
        setDrawer(null)
    }

    const submitStock = async (event: React.FormEvent) => {
        event.preventDefault()
        const quantity = Math.trunc(Number(stockForm.quantity || 0))
        if (!stockForm.productId || quantity <= 0) return
        await updateStock.mutateAsync({
            productId: stockForm.productId,
            quantity: stockForm.mode === 'OUT' ? -quantity : quantity,
            usageType: stockForm.usageType || (stockForm.mode === 'OUT' ? 'Department Use' : 'Stock Receipt'),
            issuedTo: stockForm.mode === 'OUT' ? stockForm.issuedTo || undefined : undefined,
            notes: stockForm.notes || undefined
        })
        setStockForm({ productId: '', mode: 'IN', quantity: '', issuedTo: '', usageType: 'Stock Receipt', notes: '' })
        setDrawer(null)
    }

    const submitIssue = async (event: React.FormEvent) => {
        event.preventDefault()
        const quantity = Math.trunc(Number(issueForm.quantity || 0))
        const liveStock = stockByProductId.get(issueForm.productId)
        if (!issueForm.productId || quantity <= 0 || quantity > Number(liveStock?.quantity || 0)) return
        await createIssue.mutateAsync({ ...issueForm, quantity, issuedTo: issueForm.issuedTo.trim(), notes: issueForm.notes.trim() })
        setIssueForm({ productId: '', quantity: '', usageType: 'PATIENT_CARE', issuedTo: '', notes: '' })
        setDrawer(null)
    }

    const submitPurchase = async (event: React.FormEvent) => {
        event.preventDefault()
        const quantity = Math.trunc(Number(purchaseForm.quantity || 0))
        if (!purchaseForm.productId || !purchaseForm.vendor.trim() || quantity <= 0) return
        await createPurchase.mutateAsync({ productId: purchaseForm.productId, vendor: purchaseForm.vendor.trim(), quantity })
        setPurchaseForm({ productId: '', vendor: '', quantity: '' })
        setDrawer(null)
    }

    const productColumns: Column<any>[] = [
        { key: 'product', header: 'Product', cell: (item) => <ProductCell name={item.name} category={item.category} /> },
        { key: 'unit', header: 'Unit', cell: (item) => item.unit || 'Nos' },
        { key: 'defaultRevenuePrice', header: 'Default Revenue Price', cell: (item) => money(Number(item.defaultRevenuePrice || 0)), sortable: true },
        { key: 'chargeableInCareRevenue', header: 'Care Revenue', cell: (item) => <StatusHighlighter value={item.chargeableInCareRevenue ? 'Chargeable' : 'Inventory Only'} /> },
        { key: 'status', header: 'Status', cell: (item) => <StatusHighlighter value={item.status === false ? 'Inactive' : 'Active'} /> },
        { key: 'unitId', header: 'Unit Scope', cell: (item) => unitLabelById.get(item.unitId) || item.unitId || '-' }
    ]

    const stockColumns: Column<InventoryStock>[] = [
        { key: 'product', header: 'Product', cell: (item) => <ProductCell name={item.product?.name} category={item.product?.category} /> },
        { key: 'quantity', header: 'Qty', sortable: true },
        { key: 'status', header: 'Status', cell: (item) => <StatusHighlighter value={Number(item.quantity || 0) <= 0 ? 'Out of Stock' : Number(item.quantity || 0) <= lowStockThreshold ? 'Low Stock' : 'Available'} /> },
        { key: 'updatedAt', header: 'Updated', cell: (item) => formatDate(item.updatedAt) }
    ]
    const issueColumns: Column<InventoryStockIssueRequest>[] = [
        { key: 'product', header: 'Item', cell: (item) => <ProductCell name={item.productName} category={item.category} /> },
        { key: 'quantity', header: 'Qty', sortable: true },
        { key: 'purpose', header: 'Purpose', cell: (item) => <div><p className="font-bold">{item.usageType}</p><p className="text-xs text-slate-500">{item.issuedTo || '-'}</p></div> },
        { key: 'status', header: 'Status', cell: (item) => <StatusHighlighter value={item.status} /> },
        { key: 'requestedAt', header: 'Requested', cell: (item) => formatDate(item.requestedAt) },
        { key: 'action', header: 'Action', cell: (item) => item.status !== 'PENDING' ? <span className="text-xs font-bold text-slate-500">Closed</span> : canApproveIssue ? <div className="flex gap-2"><button className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700" onClick={() => approveIssue.mutate(item.id)}>Approve</button><button className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-black text-rose-700" onClick={() => rejectIssue.mutate(item.id)}>Reject</button></div> : <span className="text-xs font-bold text-amber-600">Waiting</span> }
    ]
    const movementColumns: Column<InventoryStockMovement>[] = [
        { key: 'product', header: 'Product', cell: (item) => <ProductCell name={item.product?.name} category={item.product?.category} /> },
        { key: 'movementType', header: 'Movement', cell: (item) => <StatusHighlighter value={movementLabel[item.movementType]} /> },
        { key: 'quantity', header: 'Qty', cell: (item) => <span className={item.signedQuantity < 0 ? 'font-black text-rose-600' : 'font-black text-emerald-700'}>{item.movementType === 'CURRENT_STOCK' ? '' : item.signedQuantity < 0 ? '-' : '+'}{item.quantity}</span> },
        { key: 'reference', header: 'Reference', cell: (item) => [item.vendor, item.usageType, item.issuedTo, item.notes].filter(Boolean).join(' - ') || 'Current live stock' },
        { key: 'createdAt', header: 'Date', cell: (item) => formatDate(item.createdAt) }
    ]
    const purchaseColumns: Column<InventoryPurchase>[] = [
        { key: 'product', header: 'Product', cell: (item) => <ProductCell name={item.product?.name} category={item.product?.category} /> },
        { key: 'vendor', header: 'Vendor', sortable: true },
        { key: 'quantity', header: 'Qty', sortable: true },
        { key: 'createdAt', header: 'Date', cell: (item) => formatDate(item.createdAt) }
    ]

    return (
        <div className="flex min-h-full flex-col">
            <PageHeader title="Inventory Command Center" subtitle="Single inventory workspace for elder stock, medical inventory, purchases, issues, movements, and low-stock control." breadcrumbs={[{ label: 'Inventory' }, { label: 'Command Center' }]} />

            <div className="mb-4 grid gap-3 lg:grid-cols-[220px_220px_220px_1fr]">
                <Select label="Inventory" value={inventoryScope} onChange={(event) => { setInventoryScope(event.target.value as InventoryScope); setCategoryFilter('all') }} options={inventoryScopeOptions} />
                <Select label="Category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} options={categoryOptions} />
                <Select label="Unit Scope" value={unitScope} onChange={(event) => setUnitScope(event.target.value)} options={unitOptions} />
                <label className="block">
                    <span className="mb-1 block text-sm font-bold text-slate-700">Search</span>
                    <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search product, category, vendor, issue, holder..." className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-primary-400" />
                </label>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                {metricCards.map(({ label, value, Icon }) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                        <Icon className="h-4 w-4 text-primary-600" />
                        <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    </div>
                ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-black ${activeTab === tab ? 'bg-[#3f5f6a] text-white' : 'bg-white text-slate-700 shadow-sm'}`}>{tab}</button>)}
                <button onClick={() => setDrawer('product')} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white"><PackagePlus className="h-4 w-4" /> Product</button>
                <button onClick={() => setDrawer('stock')} className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">Stock In / Out</button>
                {canRequestIssue && <button onClick={() => setDrawer('issue')} className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-black text-amber-700">Request Issue</button>}
                <button onClick={() => setDrawer('purchase')} className="rounded-xl bg-sky-50 px-4 py-2 text-sm font-black text-sky-700">Purchase</button>
            </div>

            {activeTab === 'Overview' && <Overview scope={getInventoryScopeLabel(inventoryScope)} stock={visibleStock.slice(0, 6)} issues={visibleIssues.slice(0, 6)} movements={visibleMovements.slice(0, 6)} />}
            {activeTab === 'Products' && <DataTable data={selectedCategoryProducts} columns={productColumns} keyExtractor={(item) => item.id} isLoading={productsLoading} emptyStateMessage="No products found for this inventory scope" />}
            {activeTab === 'Stock' && <DataTable data={visibleStock} columns={stockColumns} keyExtractor={(item) => item.id} isLoading={stockLoading || productsLoading} emptyStateMessage="No stock found for this inventory scope" />}
            {activeTab === 'Issues' && <DataTable data={visibleIssues} columns={issueColumns} keyExtractor={(item) => item.id} isLoading={issuesLoading} emptyStateMessage="No stock issues found for this inventory scope" />}
            {activeTab === 'Movements' && <DataTable data={visibleMovements} columns={movementColumns} keyExtractor={(item) => item.id} isLoading={movementsLoading} emptyStateMessage="No stock movements found for this inventory scope" />}
            {activeTab === 'Purchases' && <DataTable data={visiblePurchases} columns={purchaseColumns} keyExtractor={(item) => item.id} isLoading={purchasesLoading} emptyStateMessage="No purchases found for this inventory scope" />}
            {activeTab === 'Low Stock' && <DataTable data={lowStockRows} columns={stockColumns} keyExtractor={(item) => item.id} isLoading={stockLoading} emptyStateMessage="No low stock items for this inventory scope" />}

            <Drawer isOpen={drawer === 'product'} onClose={() => setDrawer(null)} title="Add Product" size="md">
                <form onSubmit={submitProduct} className="space-y-4">
                    <Input label="Product Name" required value={productForm.name} onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))} />
                    <Input label="Category" required value={productForm.category} onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))} placeholder={inventoryScope === 'medical' ? 'medical' : 'ration / stationary / electrical'} />
                    <Input label="Unit" required value={productForm.unit} onChange={(event) => setProductForm((prev) => ({ ...prev, unit: event.target.value }))} placeholder="Nos / Visit / Trip / Test" />
                    <Input label="Default Revenue Price" type="number" min="0" value={productForm.defaultRevenuePrice} onChange={(event) => setProductForm((prev) => ({ ...prev, defaultRevenuePrice: event.target.value }))} />
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                        <input type="checkbox" checked={productForm.chargeableInCareRevenue} onChange={(event) => setProductForm((prev) => ({ ...prev, chargeableInCareRevenue: event.target.checked }))} />
                        Use in Care Revenue Sheet
                    </label>
                    <Select label="Status" value={productForm.status ? 'Active' : 'Inactive'} onChange={(event) => setProductForm((prev) => ({ ...prev, status: event.target.value === 'Active' }))} options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
                    <SubmitRow onCancel={() => setDrawer(null)} loading={createProduct.isPending} label="Save Product" />
                </form>
            </Drawer>

            <Drawer isOpen={drawer === 'stock'} onClose={() => setDrawer(null)} title="Stock In / Out" size="md">
                <form onSubmit={submitStock} className="space-y-4">
                    <Select label="Product" required value={stockForm.productId} onChange={(event) => setStockForm((prev) => ({ ...prev, productId: event.target.value }))} options={writeProductOptions} />
                    <Select label="Movement" value={stockForm.mode} onChange={(event) => setStockForm((prev) => ({ ...prev, mode: event.target.value, usageType: event.target.value === 'OUT' ? 'Department Use' : 'Stock Receipt' }))} options={[{ value: 'IN', label: 'Stock In' }, { value: 'OUT', label: 'Stock Out' }]} />
                    <Input label="Quantity" required type="number" min="1" value={stockForm.quantity} onChange={(event) => setStockForm((prev) => ({ ...prev, quantity: event.target.value }))} />
                    <Input label={stockForm.mode === 'OUT' ? 'Issued To' : 'Received From'} value={stockForm.issuedTo} onChange={(event) => setStockForm((prev) => ({ ...prev, issuedTo: event.target.value }))} />
                    <Input label="Purpose" value={stockForm.usageType} onChange={(event) => setStockForm((prev) => ({ ...prev, usageType: event.target.value }))} />
                    <Input label="Notes / Bill Ref" value={stockForm.notes} onChange={(event) => setStockForm((prev) => ({ ...prev, notes: event.target.value }))} />
                    <SubmitRow onCancel={() => setDrawer(null)} loading={updateStock.isPending} label="Save Stock" />
                </form>
            </Drawer>

            <Drawer isOpen={drawer === 'issue'} onClose={() => setDrawer(null)} title="Request Stock Issue" size="md">
                <form onSubmit={submitIssue} className="space-y-4">
                    <Select label="Product" required value={issueForm.productId} onChange={(event) => setIssueForm((prev) => ({ ...prev, productId: event.target.value }))} options={writeProductOptions} />
                    <Input label="Quantity" required type="number" min="1" value={issueForm.quantity} onChange={(event) => setIssueForm((prev) => ({ ...prev, quantity: event.target.value }))} />
                    <Input label="Usage Type" value={issueForm.usageType} onChange={(event) => setIssueForm((prev) => ({ ...prev, usageType: event.target.value }))} />
                    <Input label="Issued To" value={issueForm.issuedTo} onChange={(event) => setIssueForm((prev) => ({ ...prev, issuedTo: event.target.value }))} />
                    <Input label="Notes" value={issueForm.notes} onChange={(event) => setIssueForm((prev) => ({ ...prev, notes: event.target.value }))} />
                    <SubmitRow onCancel={() => setDrawer(null)} loading={createIssue.isPending} label="Save Request" />
                </form>
            </Drawer>

            <Drawer isOpen={drawer === 'purchase'} onClose={() => setDrawer(null)} title="Add Purchase" size="md">
                <form onSubmit={submitPurchase} className="space-y-4">
                    <Select label="Product" required value={purchaseForm.productId} onChange={(event) => setPurchaseForm((prev) => ({ ...prev, productId: event.target.value }))} options={writeProductOptions} />
                    <Input label="Vendor" required value={purchaseForm.vendor} onChange={(event) => setPurchaseForm((prev) => ({ ...prev, vendor: event.target.value }))} />
                    <Input label="Quantity" required type="number" min="1" value={purchaseForm.quantity} onChange={(event) => setPurchaseForm((prev) => ({ ...prev, quantity: event.target.value }))} />
                    <SubmitRow onCancel={() => setDrawer(null)} loading={createPurchase.isPending} label="Save Purchase" />
                </form>
            </Drawer>
        </div>
    )
}

function ProductCell({ name, category }: { name?: string | null; category?: string | null }) {
    return <div><p className="font-black text-slate-950">{name || 'Unknown Product'}</p><p className="text-xs font-semibold text-slate-500">{category || '-'}</p></div>
}

function SubmitRow({ onCancel, loading, label }: { onCancel: () => void; loading: boolean; label: string }) {
    return <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">Cancel</button><button type="submit" disabled={loading} className="rounded-xl bg-[#3f5f6a] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60">{loading ? 'Saving...' : label}</button></div>
}

function Overview({ scope, stock, issues, movements }: { scope: string; stock: InventoryStock[]; issues: InventoryStockIssueRequest[]; movements: InventoryStockMovement[] }) {
    return (
        <div className="grid gap-4 xl:grid-cols-3">
            <OverviewPanel title={`${scope} Stock`} rows={stock.map((item) => ({ title: item.product?.name || 'Stock item', detail: `${item.product?.category || '-'} | Qty ${item.quantity}`, status: Number(item.quantity || 0) <= lowStockThreshold ? 'Attention' : 'Available' }))} />
            <OverviewPanel title="Pending Issues" rows={issues.map((item) => ({ title: item.productName, detail: `${item.usageType} | ${item.issuedTo || '-'}`, status: item.status }))} />
            <OverviewPanel title="Recent Movements" rows={movements.map((item) => ({ title: item.product?.name || 'Movement', detail: `${movementLabel[item.movementType]} | Qty ${item.quantity}`, status: formatDate(item.createdAt) }))} />
        </div>
    )
}

function OverviewPanel({ title, rows }: { title: string; rows: Array<{ title: string; detail: string; status: string }> }) {
    return <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"><h2 className="text-lg font-black text-slate-950">{title}</h2><div className="mt-3 space-y-3">{rows.length ? rows.map((row, index) => <div key={`${row.title}-${index}`} className="rounded-lg border border-slate-100 p-3"><p className="font-black text-slate-900">{row.title}</p><p className="text-xs font-semibold text-slate-500">{row.detail}</p><p className="mt-2 text-xs font-black text-primary-700">{row.status}</p></div>) : <p className="text-sm font-semibold text-slate-500">No records in this scope.</p>}</div></section>
}
