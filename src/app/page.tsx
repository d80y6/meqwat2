"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  TrendingDown,
  RotateCcw,
  Layers,
  Database,
  Lock,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Coins,
  RefreshCw,
  Search,
  Wifi,
  WifiOff,
  ChevronLeft,
  Smartphone,
  Check,
  Building,
  CreditCard,
  ShieldCheck,
  Calculator,
  User,
  Activity,
  History
} from "lucide-react";

// Notification Toast type
interface Toast {
  message: string;
  type: "success" | "error" | "warning";
}

export default function MeqwatSaaSApp() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Notifications
  const [toast, setToast] = useState<Toast | null>(null);

  // Master Data States (Loaded from API)
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>({
    summary: {
      totalSales: 0,
      totalCustomerDebts: 0,
      totalSupplierLiabilities: 0,
      totalProducts: 0,
      totalSpoilage: 0,
      lowStockCount: 0,
    },
    lowStockProducts: [],
    recentSales: [],
    recentTransactions: [],
    paymentDistribution: [],
    trend: [],
  });
  const [purchases, setPurchases] = useState<any[]>([]);
  const [spoilageLogs, setSpoilageLogs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form inputs
  const [searchTerm, setSearchTerm] = useState("");

  // Product Form Input
  const [prodNameAr, setProdNameAr] = useState("");
  const [prodNameEn, setProdNameEn] = useState("");
  const [prodVariety, setProdVariety] = useState("Hamdani");
  const [prodGrade, setProdGrade] = useState("Regular");
  const [prodBuyPrice, setProdBuyPrice] = useState("");
  const [prodSellPrice, setProdSellPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodUnit, setProdUnit] = useState("Rabta");
  const [prodMinStock, setProdMinStock] = useState("5");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Customer Form Input
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custDebtLimit, setCustDebtLimit] = useState("50000");

  // Supplier Form Input
  const [suppName, setSuppName] = useState("");
  const [suppPhone, setSuppPhone] = useState("");
  const [suppLiability, setSuppLiability] = useState("0");

  // POS State
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posDiscount, setPosDiscount] = useState("0");
  const [posPaidAmount, setPosPaidAmount] = useState("");
  const [posCustomerId, setPosCustomerId] = useState("");
  const [posPaymentMethod, setPosPaymentMethod] = useState("cash");
  const [submittingSale, setSubmittingSale] = useState(false);

  // Shift Management State
  const [startingCash, setStartingCash] = useState("50000");
  const [actualCash, setActualCash] = useState("");
  const [shiftNotes, setShiftNotes] = useState("");
  const [submittingShift, setSubmittingShift] = useState(false);

  // Debt Payment Form State
  const [debtCustId, setDebtCustId] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtNotes, setDebtNotes] = useState("");
  const [submittingDebtPay, setSubmittingDebtPay] = useState(false);

  // Supplier Payment Form State
  const [liabSuppId, setLiabSuppId] = useState("");
  const [liabAmount, setLiabAmount] = useState("");
  const [liabNotes, setLiabNotes] = useState("");
  const [submittingLiabPay, setSubmittingLiabPay] = useState(false);

  // Purchase Form State
  const [purchSupplierId, setPurchSupplierId] = useState("");
  const [purchItems, setPurchItems] = useState<any[]>([{ productId: "", quantity: "", unitPrice: "" }]);
  const [purchPaidAmount, setPurchPaidAmount] = useState("");
  const [purchIsConsignment, setPurchIsConsignment] = useState(false);
  const [submittingPurchase, setSubmittingPurchase] = useState(false);

  // Spoilage Form State
  const [spoilProductId, setSpoilProductId] = useState("");
  const [spoilQuantity, setSpoilQuantity] = useState("");
  const [spoilMarkdownQty, setSpoilMarkdownQty] = useState("");
  const [spoilNotes, setSpoilNotes] = useState("");
  const [submittingSpoilage, setSubmittingSpoilage] = useState(false);

  // SaaS Tenant request state
  const [saasTenants, setSaasTenants] = useState<any[]>([
    { id: 1, name: "مؤسسة صنعاء للقات الفاخر", ownerName: "الحاج يحيى الكبسي", phone: "777112233", planName: "Pro", subscriptionStatus: "active" },
    { id: 2, name: "محل الغيل لبيع القات النموذجي", ownerName: "علي الغيلي", phone: "771223344", planName: "Basic", subscriptionStatus: "active" },
    { id: 3, name: "مخزن قعطبة للتجارة والعمولة", ownerName: "سليمان القعطبي", phone: "775443322", planName: "Pro", subscriptionStatus: "trial" },
    { id: 4, name: "تداول قات هران - فرع تعز", ownerName: "جمال المشرقي", phone: "733445566", planName: "Enterprise", subscriptionStatus: "suspended" },
  ]);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantOwner, setNewTenantOwner] = useState("");
  const [newTenantEmail, setNewTenantEmail] = useState("");
  const [newTenantPhone, setNewTenantPhone] = useState("");
  const [newTenantPlan, setNewTenantPlan] = useState("Basic");
  const [newTenantCurrency, setNewTenantCurrency] = useState("YER");
  const [submittingTenantReq, setSubmittingTenantReq] = useState(false);

  // Offline-First Flutter Mobile Simulator State
  const [isMobileOnline, setIsMobileOnline] = useState(true);
  const [mobileCart, setMobileCart] = useState<any[]>([]);
  const [mobileCustomerId, setMobileCustomerId] = useState("");
  const [mobileDiscount, setMobileDiscount] = useState("0");
  const [mobilePaidAmount, setMobilePaidAmount] = useState("");
  const [mobileQueue, setMobileQueue] = useState<any[]>([]); // SQLite offline simulated cache
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "نظام Flutter المتنقل جاهز للتداول...",
    "تم تحميل قاعدة البيانات المحلية بنجاح."
  ]);

  // Toast Trigger Helper
  const triggerToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check user session
  const checkSession = async () => {
    try {
      setLoadingAuth(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
          setTenant(data.tenant);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Fetch tenant database records
  const loadTenantData = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingData(true);
      const [pRes, cRes, sRes, shRes, stRes, puRes, spRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/customers"),
        fetch("/api/suppliers"),
        fetch("/api/pos/shift"),
        fetch("/api/dashboard/stats"),
        fetch("/api/purchases"),
        fetch("/api/spoilage"),
      ]);

      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
      if (sRes.ok) setSuppliers(await sRes.json());
      if (shRes.ok) {
        const shiftData = await shRes.json();
        setActiveShift(shiftData.activeShift);
      }
      if (stRes.ok) setDashboardStats(await stRes.json());
      if (puRes.ok) setPurchases(await puRes.json());
      if (spRes.ok) setSpoilageLogs(await spRes.json());
    } catch (e: any) {
      triggerToast("خطأ أثناء جلب البيانات من الخادم: " + e.message, "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTenantData();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSubmittingLogin(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("أهلاً بك! تم تسجيل الدخول بنجاح", "success");
        setUser(data.user);
        setTenant(data.tenant);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "خطأ غير معروف في المصادقة");
      }
    } catch (err: any) {
      setLoginError("تعذر الاتصال بالخادم. يرجى التحقق من الشبكة");
    } finally {
      setSubmittingLogin(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setIsAuthenticated(false);
        setUser(null);
        setTenant(null);
        setActiveTab("dashboard");
        triggerToast("تم تسجيل الخروج بنجاح", "success");
      }
    } catch (err) {
      triggerToast("خطأ أثناء تسجيل الخروج", "error");
    }
  };

  // Product CRUD Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr: prodNameAr,
          nameEn: prodNameEn,
          varietyType: prodVariety,
          grade: prodGrade,
          basePurchasePrice: parseFloat(prodBuyPrice || "0"),
          baseSalePrice: parseFloat(prodSellPrice || "0"),
          currentStock: parseFloat(prodStock || "0"),
          unit: prodUnit,
          minStockLevel: parseFloat(prodMinStock || "5"),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(editingProduct ? "تم تحديث بيانات الصنف بنجاح" : "تمت إضافة الصنف الجديد بنجاح", "success");
        // Reset state
        setProdNameAr("");
        setProdNameEn("");
        setProdBuyPrice("");
        setProdSellPrice("");
        setProdStock("");
        setProdMinStock("5");
        setEditingProduct(null);
        loadTenantData();
      } else {
        triggerToast(data.error || "خطأ أثناء حفظ الصنف", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleEditProductClick = (prod: any) => {
    setEditingProduct(prod);
    setProdNameAr(prod.nameAr);
    setProdNameEn(prod.nameEn || "");
    setProdVariety(prod.varietyType);
    setProdGrade(prod.grade);
    setProdBuyPrice(prod.basePurchasePrice);
    setProdSellPrice(prod.baseSalePrice);
    setProdStock(prod.currentStock);
    setProdUnit(prod.unit);
    setProdMinStock(prod.minStockLevel);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الصنف نهائياً من المستودع؟")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("تم حذف الصنف وتصفية قيوده بنجاح", "success");
        loadTenantData();
      } else {
        triggerToast(data.error || "فشل حذف الصنف", "error");
      }
    } catch (e: any) {
      triggerToast(e.message, "error");
    }
  };

  // Customer Creator
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: custName,
          phone: custPhone,
          address: custAddress,
          maxDebtLimit: parseFloat(custDebtLimit || "50000"),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`تم تسجيل العميل الجديد ${custName} بنجاح`, "success");
        setCustName("");
        setCustPhone("");
        setCustAddress("");
        setCustDebtLimit("50000");
        loadTenantData();
      } else {
        triggerToast(data.error || "فشل حفظ العميل", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // Supplier Creator
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suppName,
          phone: suppPhone,
          currentLiability: parseFloat(suppLiability || "0"),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`تم تسجيل المورد ${suppName} بنجاح`, "success");
        setSuppName("");
        setSuppPhone("");
        setSuppLiability("0");
        loadTenantData();
      } else {
        triggerToast(data.error || "فشل تسجيل المورد", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  // Shift Control
  const handleShiftControl = async (action: "open" | "close") => {
    setSubmittingShift(true);
    try {
      const res = await fetch("/api/pos/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          startingCash: parseFloat(startingCash || "0"),
          actualCash: parseFloat(actualCash || "0"),
          notes: shiftNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(action === "open" ? "تم فتح صندوق المبيعات بنجاح" : "تم إغلاق الوردية وتصفية الحسابات بنجاح", "success");
        setStartingCash("50000");
        setActualCash("");
        setShiftNotes("");
        loadTenantData();
      } else {
        triggerToast(data.error || "خطأ في تعديل الوردية", "error");
      }
    } catch (e: any) {
      triggerToast(e.message, "error");
    } finally {
      setSubmittingShift(false);
    }
  };

  // POS Cart Management
  const addToCart = (product: any) => {
    if (parseFloat(product.currentStock) <= 0) {
      triggerToast("لا يوجد مخزون كافي للبيع من هذا الصنف!", "warning");
      return;
    }

    const existingIdx = posCart.findIndex(item => item.product.id === product.id);
    if (existingIdx > -1) {
      const currentQtyInCart = posCart[existingIdx].quantity;
      if (currentQtyInCart + 1 > parseFloat(product.currentStock)) {
        triggerToast(`الكمية المطلوبة تتجاوز المتاح في المستودع وهو ${product.currentStock} ربطة`, "warning");
        return;
      }
      const updated = [...posCart];
      updated[existingIdx].quantity += 1;
      updated[existingIdx].totalPrice = updated[existingIdx].quantity * parseFloat(updated[existingIdx].unitPrice);
      setPosCart(updated);
    } else {
      setPosCart([...posCart, {
        product,
        quantity: 1,
        unitPrice: parseFloat(product.baseSalePrice),
        totalPrice: parseFloat(product.baseSalePrice)
      }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setPosCart(posCart.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId: number, qtyStr: string, stockLimit: number) => {
    const parsedQty = parseFloat(qtyStr || "0");
    if (parsedQty <= 0) return;
    if (parsedQty > stockLimit) {
      triggerToast(`الحد الأقصى للمخزون المتوفر هو ${stockLimit} ربطة`, "warning");
      return;
    }
    const updated = posCart.map(item => {
      if (item.product.id === productId) {
        const quantity = parsedQty;
        const totalPrice = quantity * item.unitPrice;
        return { ...item, quantity, totalPrice };
      }
      return item;
    });
    setPosCart(updated);
  };

  // Calculate POS Total
  const posSubtotal = posCart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountVal = parseFloat(posDiscount || "0");
  const posFinalAmount = Math.max(0, posSubtotal - discountVal);

  // Auto-fill paidAmount when payment method changes
  useEffect(() => {
    if (posPaymentMethod === "cash" || posPaymentMethod === "credit") {
      setPosPaidAmount(String(posFinalAmount));
    } else if (posPaymentMethod === "debt") {
      setPosPaidAmount("0");
    } else {
      setPosPaidAmount("");
    }
  }, [posPaymentMethod, posFinalAmount]);

  // Submit POS Sale
  const handleProcessSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posCart.length) {
      triggerToast("سلة المبيعات فارغة!", "warning");
      return;
    }

    const paid = parseFloat(posPaidAmount || "0");
    if (posPaymentMethod === "mixed" && isNaN(paid)) {
      triggerToast("الرجاء إدخال المبلغ المدفوع نقداً للمبيعات المختلطة", "warning");
      return;
    }

    setSubmittingSale(true);
    try {
      const res = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: posCustomerId ? parseInt(posCustomerId) : null,
          items: posCart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          })),
          discount: parseFloat(posDiscount || "0"),
          paidAmount: paid,
          paymentMethod: posPaymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("تم تسجيل عملية البيع وتحديث المخزون بنجاح الفاتورة جاهزة للطباعة", "success");
        setPosCart([]);
        setPosDiscount("0");
        setPosCustomerId("");
        setPosPaymentMethod("cash");
        loadTenantData();
      } else {
        triggerToast(data.error || "فشل تسجيل الفاتورة", "error");
      }
    } catch (e: any) {
      triggerToast(e.message, "error");
    } finally {
      setSubmittingSale(false);
    }
  };

  // Customer Debt Payment
  const handleCustomerDebtPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDebtPay(true);
    try {
      const res = await fetch("/api/payments/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: parseInt(debtCustId),
          paymentAmount: parseFloat(debtAmount || "0"),
          notes: debtNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("تم قيد دفعة سداد العميل بنجاح في السجل والوردية", "success");
        setDebtCustId("");
        setDebtAmount("");
        setDebtNotes("");
        loadTenantData();
      } else {
        triggerToast(data.error || "خطأ أثناء قيد الدفع", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    } finally {
      setSubmittingDebtPay(false);
    }
  };

  // Supplier Liability Payment
  const handleSupplierLiabilityPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLiabPay(true);
    try {
      const res = await fetch("/api/payments/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: parseInt(liabSuppId),
          paymentAmount: parseFloat(liabAmount || "0"),
          notes: liabNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("تم تسجيل الدفعة المصروفة للمورد بنجاح من الصندوق المالي الرئيسي", "success");
        setLiabSuppId("");
        setLiabAmount("");
        setLiabNotes("");
        loadTenantData();
      } else {
        triggerToast(data.error || "خطأ أثناء ترحيل السند للمورد", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    } finally {
      setSubmittingLiabPay(false);
    }
  };

  // Record Spoilage/Markdown
  const handleRecordSpoilage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSpoilage(true);
    try {
      const res = await fetch("/api/spoilage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(spoilProductId),
          spoiledQuantity: parseFloat(spoilQuantity || "0"),
          markdownQuantity: parseFloat(spoilMarkdownQty || "0"),
          notes: spoilNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("تم تقييد التالف اليومي الفاقد وتسوية المخزن بنجاح", "success");
        setSpoilProductId("");
        setSpoilQuantity("");
        setSpoilMarkdownQty("");
        setSpoilNotes("");
        loadTenantData();
      } else {
        triggerToast(data.error || "خطأ أثناء قيد التالف", "error");
      }
    } catch (err: any) {
      triggerToast(err.message, "error");
    } finally {
      setSubmittingSpoilage(false);
    }
  };

  // Supplier Purchase (Tawreed) Management
  const addPurchItemRow = () => {
    setPurchItems([...purchItems, { productId: "", quantity: "", unitPrice: "" }]);
  };

  const removePurchItemRow = (idx: number) => {
    setPurchItems(purchItems.filter((_, i) => i !== idx));
  };

  const updatePurchItemRow = (idx: number, field: string, val: string) => {
    const updated = [...purchItems];
    updated[idx][field] = val;
    setPurchItems(updated);
  };

  const handleProcessPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchSupplierId) {
      triggerToast("الرجاء اختيار المورد أولاً", "warning");
      return;
    }

    setSubmittingPurchase(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: parseInt(purchSupplierId),
          items: purchItems.map(it => ({
            productId: parseInt(it.productId),
            quantity: parseFloat(it.quantity || "0"),
            unitPrice: parseFloat(it.unitPrice || "0")
          })),
          paidAmount: parseFloat(purchPaidAmount || "0"),
          isConsignment: purchIsConsignment,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("تم ترحيل فاتورة التوريد بنجاح وزيادة كميات المستودع", "success");
        setPurchSupplierId("");
        setPurchItems([{ productId: "", quantity: "", unitPrice: "" }]);
        setPurchPaidAmount("");
        setPurchIsConsignment(false);
        loadTenantData();
      } else {
        triggerToast(data.error || "خطأ أثناء حفظ التوريد", "error");
      }
    } catch (e: any) {
      triggerToast(e.message, "error");
    } finally {
      setSubmittingPurchase(false);
    }
  };

  // SaaS Tenant Request Simulator
  const handleCreateTenantRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantOwner || !newTenantPhone) {
      triggerToast("الرجاء تعبئة بيانات المؤسسة والمالك لتسجيل الاشتراك", "warning");
      return;
    }

    setSubmittingTenantReq(true);
    setTimeout(() => {
      const newTen = {
        id: saasTenants.length + 1,
        name: newTenantName,
        ownerName: newTenantOwner,
        phone: newTenantPhone,
        planName: newTenantPlan,
        subscriptionStatus: "active"
      };
      setSaasTenants([...saasTenants, newTen]);
      triggerToast("تم إنشاء المساحة المنعزلة بنجاح! تم قيد اشتراك المستأجر الجديد", "success");
      setNewTenantName("");
      setNewTenantOwner("");
      setNewTenantEmail("");
      setNewTenantPhone("");
      setSubmittingTenantReq(false);
    }, 1200);
  };

  const toggleTenantStatus = (id: number) => {
    setSaasTenants(saasTenants.map(t => {
      if (t.id === id) {
        const nextStatus = t.subscriptionStatus === "active" ? "suspended" : "active";
        triggerToast(`تم ${nextStatus === "suspended" ? "تعليق" : "تفعيل"} اشتراك المساحة بنجاح`, "warning");
        return { ...t, subscriptionStatus: nextStatus };
      }
      return t;
    }));
  };

  // FLUTTER MOBILE APP OFFLINE WORKFLOWS SIMULATION
  const logMobileEvent = (text: string) => {
    setSyncLogs(prev => [ `[${new Date().toLocaleTimeString('ar-YE')}] ${text}`, ...prev ]);
  };

  const addProductToMobileCart = (product: any) => {
    const existing = mobileCart.find(it => it.product.id === product.id);
    if (existing) {
      setMobileCart(mobileCart.map(it => it.product.id === product.id ? { ...it, quantity: it.quantity + 1 } : it));
    } else {
      setMobileCart([...mobileCart, { product, quantity: 1, unitPrice: parseFloat(product.baseSalePrice) }]);
    }
    logMobileEvent(`أضيف للسلة: ${product.nameAr}`);
  };

  const handleMobileOfflineSale = () => {
    if (!mobileCart.length) {
      logMobileEvent("خطأ: السلة فارغة!");
      return;
    }

    const mSubtotal = mobileCart.reduce((s, c) => s + (c.quantity * c.unitPrice), 0);
    const mDisc = parseFloat(mobileDiscount || "0");
    const mFinal = Math.max(0, mSubtotal - mDisc);
    const mPaid = parseFloat(mobilePaidAmount || String(mFinal));
    const mDebt = Math.max(0, mFinal - mPaid);

    const uuid = "offline-uuid-" + Math.random().toString(36).substring(2, 11);

    const localTx = {
      offlineUuid: uuid,
      customerId: mobileCustomerId ? parseInt(mobileCustomerId) : null,
      customerName: mobileCustomerId ? (customers.find(c => c.id === parseInt(mobileCustomerId))?.name || "عميل آجل") : "نقدي مباشر",
      items: mobileCart.map(it => ({
        productId: it.product.id,
        nameAr: it.product.nameAr,
        quantity: it.quantity,
        unitPrice: it.unitPrice
      })),
      discount: mDisc,
      paidAmount: mPaid,
      debtAmount: mDebt,
      paymentMethod: mDebt > 0 ? "debt" : "cash",
      status: "pending_sync",
      createdAt: new Date().toISOString()
    };

    setMobileQueue([...mobileQueue, localTx]);
    setMobileCart([]);
    setMobilePaidAmount("");
    setMobileCustomerId("");
    logMobileEvent(`تم حفظ الفاتورة بنجاح في SQLite المحلي (أوفلاين). كود التعريف: ${uuid}`);
    triggerToast("تم تخزين الفاتورة محلياً في ذاكرة الجوال بنجاح", "success");
  };

  const syncMobileTransactions = async () => {
    if (mobileQueue.length === 0) {
      logMobileEvent("لا توجد معاملات معلقة للمزامنة.");
      return;
    }

    if (!isMobileOnline) {
      logMobileEvent("خطأ المزامنة: الجوال غير متصل بالشبكة! يرجى تشغيل الواي فاي أولاً.");
      triggerToast("الجوال خارج التغطية حالياً!", "error");
      return;
    }

    logMobileEvent(`جاري محاولة مزامنة عدد ${mobileQueue.length} فواتير مع الخادم الرئيسي...`);

    let successCount = 0;
    const nextQueue = [];

    for (const tx of mobileQueue) {
      try {
        logMobileEvent(`مزامنة الفاتورة ${tx.offlineUuid}...`);
        const res = await fetch("/api/pos/sale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: tx.customerId,
            items: tx.items,
            discount: tx.discount,
            paidAmount: tx.paidAmount,
            paymentMethod: tx.paymentMethod,
            offlineUuid: tx.offlineUuid // Idempotency token
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          logMobileEvent(`تأكيد السيرفر للفاتورة ${tx.offlineUuid}: نجاح المزامنة وتأمين المخزون.`);
          successCount++;
        } else {
          logMobileEvent(`فشل مزامنة ${tx.offlineUuid}: ${data.error || "خطأ مجهول"}`);
          nextQueue.push(tx); // Keep in queue for retry-safe processing
        }
      } catch (err: any) {
        logMobileEvent(`خطأ شبكة أثناء مزامنة ${tx.offlineUuid}: ${err.message}. تم إبقاء المعاملة في الطابور المحمي.`);
        nextQueue.push(tx);
      }
    }

    setMobileQueue(nextQueue);
    if (successCount > 0) {
      triggerToast(`تم مزامنة عدد ${successCount} فواتير وتأكيد رصيدها بالكامل`, "success");
      loadTenantData();
    }
  };

  // Filter products by search
  const filteredProducts = products.filter(p =>
    p.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.varietyType && p.varietyType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* HEADER BAR */}
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white font-bold text-lg shadow">
              ميقوات
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight flex items-center gap-2">
                ميقوات ساس <span className="text-xs bg-emerald-500 text-emerald-950 font-semibold px-2 py-0.5 rounded-full">اصدار التداول</span>
              </h1>
              <p className="text-xs text-emerald-300">منصة إدارة مبيعات محلات القات - متعددة المستأجرين</p>
            </div>
          </div>

          {/* Authentication State header */}
          {isAuthenticated && user && tenant && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs text-emerald-200 bg-emerald-850 px-2 py-1 rounded">
                  المساحة المنعزلة: <strong className="text-white">{tenant.name}</strong>
                </span>
                <span className="text-sm font-medium text-white flex items-center gap-1 mt-1 justify-end">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  {user.name} ({user.role === "admin" ? "مدير النظام" : user.role === "manager" ? "مدير المحل" : "كاشير"})
                </span>
              </div>

              {activeShift ? (
                <div className="bg-emerald-800 text-emerald-100 text-xs px-3 py-1.5 rounded-full border border-emerald-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  وردية مفتوحة
                </div>
              ) : (
                <div className="bg-amber-800 text-amber-100 text-xs px-3 py-1.5 rounded-full border border-amber-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  الوردية مغلقة
                </div>
              )}

              <button
                onClick={handleLogout}
                className="bg-emerald-700 hover:bg-red-700 transition-all text-white p-2 rounded-full cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-5 left-5 z-50 animate-bounce">
          <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-3 text-white max-w-sm ${
            toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-rose-600" : "bg-amber-500"
          }`}>
            {toast.type === "success" && <CheckCircle className="w-6 h-6 shrink-0" />}
            {toast.type === "error" && <AlertTriangle className="w-6 h-6 shrink-0" />}
            {toast.type === "warning" && <Clock className="w-6 h-6 shrink-0" />}
            <span className="font-bold text-sm leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      {!isAuthenticated ? (
        /* LOGIN / SEED PAGE */
        <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 -z-0 opacity-40"></div>
            
            <div className="text-center relative z-10">
              <div className="bg-emerald-100 text-emerald-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Layers className="w-10 h-10 text-emerald-700" />
              </div>
              <h2 className="text-2xl font-black text-slate-800">بوابة نظام ميقوات ساس</h2>
              <p className="text-sm text-slate-500 mt-2">يرجى تسجيل الدخول للوصول إلى مساحة العمل المعزولة الخاصة بك</p>
            </div>

            {loginError && (
              <div className="bg-rose-50 border-r-4 border-rose-500 text-rose-800 p-3 rounded-lg text-sm font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم المستخدم التجريبي</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-right font-medium text-slate-800 bg-slate-50"
                  placeholder="مثال: admin أو cashier"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 font-sans">كلمة المرور</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-right font-sans bg-slate-50"
                  placeholder="اكتب كلمة المرور: password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submittingLogin}
                className="w-full bg-emerald-700 hover:bg-emerald-800 transition-colors text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer"
              >
                {submittingLogin ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                تسجيل الدخول الآمن للمنصة
              </button>
            </form>

            <div className="border-t border-slate-100 pt-5 text-center">
              <span className="text-xs text-slate-400 block mb-3">الدخول السريع بحسابات مسبقة التوليد والتهيئة:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => { setLoginUsername("admin"); setLoginPassword("password"); }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold p-2.5 rounded-lg border border-emerald-100 cursor-pointer"
                >
                  حساب مدير النظام (admin)
                </button>
                <button
                  onClick={() => { setLoginUsername("cashier"); setLoginPassword("password"); }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold p-2.5 rounded-lg border border-emerald-100 cursor-pointer"
                >
                  حساب الكاشير (cashier)
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                * عند تسجيل الدخول لأول مرة، سيقوم النظام تلقائياً بتهيئة وزرع قاعدة بيانات PostgreSQL بجداول معزولة وبيانات بيع وشراء تجريبية كاملة.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* LOGGED IN WORKSPACE */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
            <div className="bg-white p-4 rounded-2xl shadow border border-slate-100 text-center">
              <p className="text-xs text-slate-400">المستخدم النشط</p>
              <h3 className="font-bold text-slate-800 mt-1">{user?.name}</h3>
              <span className="inline-block bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full mt-2">
                {user?.role === "admin" ? "المدير العام" : user?.role === "manager" ? "مدير المحل" : "كاشير الصندوق"}
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                لوحة التحكم الإحصائية
              </button>

              <button
                onClick={() => setActiveTab("pos")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "pos"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                شاشة نقطة البيع السريعة
              </button>

              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "products"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Package className="w-4 h-4" />
                المخزون وأصناف القات
              </button>

              <button
                onClick={() => setActiveTab("customers")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "customers"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Users className="w-4 h-4" />
                حسابات ديون العملاء
              </button>

              <button
                onClick={() => setActiveTab("suppliers")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "suppliers"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Truck className="w-4 h-4" />
                الموردين والأمانات
              </button>

              <button
                onClick={() => setActiveTab("shifts")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "shifts"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Clock className="w-4 h-4" />
                الورديات وصندوق الصرف
              </button>

              <button
                onClick={() => setActiveTab("spoilage")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "spoilage"
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                تالف وفاقد اليوم (بايت)
              </button>

              <button
                onClick={() => setActiveTab("mobile_simulator")}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap border-t border-slate-100 pt-4 text-indigo-700 hover:bg-indigo-50 ${
                  activeTab === "mobile_simulator"
                    ? "bg-indigo-700 text-white! shadow-md"
                    : ""
                }`}
              >
                <Smartphone className="w-4 h-4" />
                محاكي تطبيق Flutter الميداني
              </button>

              {user?.role === "admin" && (
                <button
                  onClick={() => setActiveTab("saas_admin")}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap border-t border-slate-100 pt-4 text-purple-700 hover:bg-purple-50 ${
                    activeTab === "saas_admin"
                      ? "bg-purple-700 text-white! shadow-md"
                      : ""
                  }`}
                >
                  <Building className="w-4 h-4" />
                  اشتراكات المستأجرين SaaS
                </button>
              )}
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-inner mt-4 border border-slate-800 text-xs leading-relaxed space-y-2 hidden lg:block">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1.5">
                <Database className="w-4 h-4" />
                حالة بيئة التطوير
              </div>
              <p>مستودع البيانات: <strong className="text-white">PostgreSQL 16</strong></p>
              <p>واجهة الربط: <strong className="text-white">Drizzle ORM</strong></p>
              <p>العزل المالي للمستأجرين: <strong className="text-white">منفذ بالكامل بقاعدة البيانات</strong></p>
              <div className="pt-2 border-t border-slate-850 flex justify-between">
                <span>تحديث تلقائي:</span>
                <span className="text-emerald-400">نشط</span>
              </div>
            </div>
          </aside>

          {/* TAB CONTENTS CONTAINER */}
          <main className="flex-1 min-w-0 space-y-6">
            {loadingData && (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري تحديث البيانات ومزامنة رصيد المستودع والمالية مع قاعدة البيانات...
              </div>
            )}

            {/* TAB 1: DASHBOARD STATS */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-fade-in">
                {/* METRICS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Sales Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">إجمالي مبيعات المتجر</span>
                      <strong className="text-2xl font-black text-slate-800 mt-1 block">
                        {dashboardStats.summary.totalSales.toLocaleString("ar-YE")} YER
                      </strong>
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 mt-2">
                        +14.2% مقارنة بأمس
                      </span>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                      <Coins className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Customer Debts */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">ديون العملاء الآجلة</span>
                      <strong className="text-2xl font-black text-rose-600 mt-1 block">
                        {dashboardStats.summary.totalCustomerDebts.toLocaleString("ar-YE")} YER
                      </strong>
                      <span className="text-xs text-slate-500 font-medium block mt-2">
                        سقف الديون الإجمالي مؤمن بالكامل
                      </span>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl text-rose-600">
                      <Users className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Supplier Liabilities */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">مستحقات الموردين (الأمانات)</span>
                      <strong className="text-2xl font-black text-amber-600 mt-1 block">
                        {dashboardStats.summary.totalSupplierLiabilities.toLocaleString("ar-YE")} YER
                      </strong>
                      <span className="text-xs text-amber-600 font-bold mt-2 block">
                        حسابات أمانة معلقة (مقوتة)
                      </span>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                      <Truck className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Spoilage / Total items */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">فقد وتالف اليوم</span>
                      <strong className="text-2xl font-black text-slate-700 mt-1 block">
                        {dashboardStats.summary.totalSpoilage.toLocaleString("ar-YE")} ربطة
                      </strong>
                      <span className="text-xs text-rose-500 font-semibold block mt-2">
                        يؤثر في هامش الربح اليومي
                      </span>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
                      <TrendingDown className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                {/* VISUAL CHARTS SIMULATION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sales trend */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-base">منحنى التداول ومبيعات الآجل الأسبوعية</h3>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">محدثة في الزمن الحقيقي</span>
                    </div>

                    {/* CSS Chart */}
                    <div className="h-60 flex items-end gap-3 pt-6 border-b border-slate-100">
                      {dashboardStats.trend.map((day: any, i: number) => {
                        const totalHeight = Math.min(100, (day.sales / 600000) * 100);
                        const debtHeight = Math.min(100, (day.debt / 600000) * 100);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
                            {/* Hover tooltip */}
                            <div className="absolute -top-10 bg-slate-900 text-white text-[10px] p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap text-center">
                              البيع: {day.sales.toLocaleString()} YER<br />
                              الآجل: {day.debt.toLocaleString()} YER
                            </div>

                            {/* Stacked columns */}
                            <div className="w-full flex gap-1 justify-center items-end h-full">
                              <div
                                style={{ height: `${totalHeight}%` }}
                                className="w-3 bg-emerald-600 rounded-t-sm hover:bg-emerald-700 transition-all"
                              ></div>
                              <div
                                style={{ height: `${debtHeight}%` }}
                                className="w-3 bg-rose-500 rounded-t-sm hover:bg-rose-600 transition-all"
                              ></div>
                            </div>

                            <span className="text-[11px] text-slate-500 font-bold mt-2">{day.date}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-4 text-xs font-bold justify-center pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
                        <span>مبيعات نقدية + بطاقة</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
                        <span>سحوبات الديون والآجل</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock alerting widget */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      تنبيهات انخفاض المخزون
                    </h3>
                    <p className="text-xs text-slate-500">أصناف شارفت على النفاد في المتجر، يجب إعادة التوريد من الموردين فوراً لتفادي توقف الصندوق:</p>

                    <div className="space-y-3">
                      {dashboardStats.lowStockProducts && dashboardStats.lowStockProducts.length > 0 ? (
                        dashboardStats.lowStockProducts.map((p: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-2.5 bg-rose-50 rounded-lg border border-rose-100">
                            <div>
                              <strong className="text-sm text-slate-800 block">{p.nameAr}</strong>
                              <span className="text-xs text-slate-400">الحد الحرج: {p.minStockLevel} {p.unit}</span>
                            </div>
                            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-1 rounded">
                              {p.currentStock} {p.unit} متبقي
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl">
                          لا توجد تنبيهات نقص مخزون حالياً
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RECENT HISTORIES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent sales history */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <History className="w-5 h-5 text-emerald-600" />
                      آخر مبيعات المتجر (مؤمنة)
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400">
                            <th className="pb-2">رقم الفاتورة</th>
                            <th className="pb-2">العميل</th>
                            <th className="pb-2">القيمة الإجمالية</th>
                            <th className="pb-2">طريقة الدفع</th>
                            <th className="pb-2">الوقت</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {dashboardStats.recentSales.map((s: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2.5">#{s.id}</td>
                              <td className="py-2.5 font-bold text-slate-800">{s.customerName || "نقدي مباشر"}</td>
                              <td className="py-2.5 font-sans font-bold">{parseFloat(s.finalAmount).toLocaleString()} YER</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s.paymentMethod === "cash" ? "bg-emerald-100 text-emerald-800" :
                                  s.paymentMethod === "debt" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                                }`}>
                                  {s.paymentMethod === "cash" ? "نقدي" : s.paymentMethod === "debt" ? "آجل" : "مختلط"}
                                </span>
                              </td>
                              <td className="py-2.5 text-slate-400">{new Date(s.createdAt).toLocaleTimeString("ar-YE")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial journal feed */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      دفتر قيود الخزينة والوارد والصادر
                    </h3>

                    <div className="space-y-3">
                      {dashboardStats.recentTransactions.map((tx: any, i: number) => (
                        <div key={i} className="flex justify-between items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="space-y-1">
                            <strong className="text-xs text-slate-800 block">{tx.description}</strong>
                            <span className="text-[10px] text-slate-400 block">{new Date(tx.createdAt).toLocaleString("ar-YE")}</span>
                          </div>
                          <span className={`text-xs font-bold font-sans ${
                            tx.direction === "in" ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {tx.direction === "in" ? "+" : "-"} {parseFloat(tx.amount).toLocaleString()} YER
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: POINT OF SALE (POS) */}
            {activeTab === "pos" && (
              <div className="space-y-6 animate-fade-in">
                {!activeShift ? (
                  <div className="bg-white p-8 rounded-2xl shadow border border-slate-100 text-center max-w-xl mx-auto space-y-4">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
                    <h3 className="text-xl font-bold text-slate-800">صندوق المبيعات والوردية مغلق حالياً</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      لتتمكن من بيع القات وتسجيل المعاملات واستلام الأموال النقدية، يرجى فتح الوردية وتحديد رصيد العهدة النقدي الابتدائي لدرج الكاشير:
                    </p>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm mx-auto text-right">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">العهدة النقدية الابتدائية في الصندوق (YER)</label>
                      <input
                        type="number"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-left font-sans font-bold focus:outline-none focus:border-emerald-500"
                        value={startingCash}
                        onChange={(e) => setStartingCash(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={() => handleShiftControl("open")}
                      disabled={submittingShift}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl shadow cursor-pointer"
                    >
                      {submittingShift ? "جاري فتح الوردية..." : "ابدأ وردية تداول جديدة وافتح الصندوق"}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT PANEL: PRODUCT SELECTOR */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-3 items-center">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="ابحث عن صنف قات (همداني، شامي، عنسي...)"
                          className="bg-transparent border-none w-full text-xs font-medium text-slate-800 focus:outline-none"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      {/* Products Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredProducts.map((p, i) => {
                          const stock = parseFloat(p.currentStock);
                          return (
                            <div
                              key={i}
                              onClick={() => addToCart(p)}
                              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    {p.varietyType}
                                  </span>
                                  <h4 className="font-bold text-slate-800 mt-2 text-sm">{p.nameAr}</h4>
                                  <p className="text-[11px] text-slate-400">الدرجة: {p.grade}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                  stock > 10 ? "bg-slate-100 text-slate-600" : "bg-rose-50 text-rose-600"
                                }`}>
                                  المتاح: {p.currentStock} {p.unit}
                                </span>
                              </div>

                              <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                                <span className="text-xs text-slate-400">سعر الربطة:</span>
                                <strong className="text-sm font-sans font-extrabold text-slate-800">
                                  {parseFloat(p.baseSalePrice).toLocaleString()} YER
                                </strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* RIGHT PANEL: CART & CHECKOUT */}
                    <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-md flex flex-col justify-between min-h-[550px]">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h3 className="font-bold text-slate-850">سلة المشتريات الحالية</h3>
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold">
                            {posCart.length} أصناف في السلة
                          </span>
                        </div>

                        {/* Cart Items List */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {posCart.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                              <div className="space-y-1">
                                <strong className="text-slate-800 block">{item.product.nameAr}</strong>
                                <span className="text-[10px] text-slate-400">سعر الوحدة: {item.unitPrice} YER</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  className="w-12 p-1 border border-slate-300 rounded font-sans text-center text-xs"
                                  value={item.quantity}
                                  onChange={(e) => updateCartQty(item.product.id, e.target.value, parseFloat(item.product.currentStock))}
                                />
                                <span className="text-slate-400">{item.product.unit}</span>

                                <button
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="text-rose-600 hover:text-rose-800 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {posCart.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                              <ShoppingCart className="w-10 h-10 mx-auto opacity-35 mb-2" />
                              <p className="text-xs">السلة فارغة. انقر على الأصناف لإضافتها هنا</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CALCULATIONS & FORM */}
                      <form onSubmit={handleProcessSale} className="space-y-4 border-t border-slate-100 pt-4 mt-4">
                        <div className="space-y-2 text-xs">
                          {/* Discount Input */}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-bold">خصم تجاري خاص (YER):</span>
                            <input
                              type="number"
                              className="w-32 p-1.5 border border-slate-200 rounded-lg text-left font-sans"
                              value={posDiscount}
                              onChange={(e) => setPosDiscount(e.target.value)}
                            />
                          </div>

                          {/* Customer Selector */}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-bold">العميل لتقييد الآجل:</span>
                            <select
                              className="w-48 p-1.5 border border-slate-250 rounded-lg text-xs"
                              value={posCustomerId}
                              onChange={(e) => setPosCustomerId(e.target.value)}
                            >
                              <option value="">-- بيع نقدي مباشر (Walk-in) --</option>
                              {customers.map((c, idx) => (
                                <option key={idx} value={c.id}>
                                  {c.name} (دين الحالي: {parseFloat(c.currentDebt).toLocaleString()})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Payment Method */}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-bold">طريقة الدفع ومصادقتها:</span>
                            <div className="flex gap-1.5">
                              {["cash", "debt", "mixed"].map((method) => (
                                <button
                                  key={method}
                                  type="button"
                                  onClick={() => setPosPaymentMethod(method)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold ${
                                    posPaymentMethod === method ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {method === "cash" ? "نقدي كامل" : method === "debt" ? "آجل بالكامل" : "مختلط (دفعة)"}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Paid Amount (for mixed/cash) */}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-bold">المبلغ المدفوع نقدياً (YER):</span>
                            <input
                              type="number"
                              disabled={posPaymentMethod === "cash" || posPaymentMethod === "debt"}
                              className="w-32 p-1.5 border border-slate-200 rounded-lg text-left font-sans bg-slate-50"
                              value={posPaidAmount}
                              onChange={(e) => setPosPaidAmount(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* FINAL INVOICE SUMMARY */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex justify-between text-slate-500 text-xs">
                            <span>المجموع الفرعي:</span>
                            <span className="font-sans font-bold">{posSubtotal.toLocaleString()} YER</span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-xs">
                            <span>الخصم الممنوح:</span>
                            <span className="font-sans font-bold text-rose-600">-{parseFloat(posDiscount || "0").toLocaleString()} YER</span>
                          </div>
                          <div className="flex justify-between text-slate-800 text-sm font-extrabold border-t border-slate-200 pt-2">
                            <span>صافي المبلغ المستحق:</span>
                            <span className="font-sans text-emerald-800 text-base">{posFinalAmount.toLocaleString()} YER</span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingSale || !posCart.length}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl font-bold text-sm shadow cursor-pointer flex items-center justify-center gap-2"
                        >
                          {submittingSale ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                          تأكيد وطباعة فاتورة التداول الرسمية
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: INVENTORY & PRODUCTS CRUD */}
            {activeTab === "products" && (
              <div className="space-y-6 animate-fade-in">
                {/* Product Add/Edit Form */}
                {user?.role !== "cashier" && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-850 flex items-center gap-2 text-base">
                      <Plus className="w-5 h-5 text-emerald-600" />
                      {editingProduct ? "تعديل بيانات صنف قات" : "إضافة صنف قات جديد للمستودع"}
                    </h3>

                    <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
                      <div>
                        <label className="block text-slate-600 mb-1.5">الاسم بالعربية (مثال: قات همداني سوبر)</label>
                        <input
                          type="text"
                          required
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                          placeholder="قات همداني قطاف اليوم"
                          value={prodNameAr}
                          onChange={(e) => setProdNameAr(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">الاسم بالإنجليزية (اختياري)</label>
                        <input
                          type="text"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left"
                          placeholder="Hamdani Super"
                          value={prodNameEn}
                          onChange={(e) => setProdNameEn(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">النوع / الفصيلة</label>
                        <select
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                          value={prodVariety}
                          onChange={(e) => setProdVariety(e.target.value)}
                        >
                          <option value="Hamdani">همداني (Hamdani)</option>
                          <option value="Shami">شامي (Shami)</option>
                          <option value="Ghaili">غيلي (Ghaili)</option>
                          <option value="Ansi">عنسي (Ansi)</option>
                          <option value="Harazi">حرازي (Harazi)</option>
                          <option value="Bait">بايت (Bait)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">الرتبة والجودة</label>
                        <select
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                          value={prodGrade}
                          onChange={(e) => setProdGrade(e.target.value)}
                        >
                          <option value="Super">سوبر سوبر فاخر</option>
                          <option value="Excellent">ممتاز ممتاز</option>
                          <option value="Regular">متوسط / عادي</option>
                          <option value="Low">رخيص / منخفض الجودة</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">سعر الشراء الأساسي (YER)</label>
                        <input
                          type="number"
                          required
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left font-sans font-bold"
                          placeholder="مثال: 5000"
                          value={prodBuyPrice}
                          onChange={(e) => setProdBuyPrice(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">سعر البيع الافتراضي (YER)</label>
                        <input
                          type="number"
                          required
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left font-sans font-bold"
                          placeholder="مثال: 7500"
                          value={prodSellPrice}
                          onChange={(e) => setProdSellPrice(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">المخزون المتوفر المبدئي</label>
                        <input
                          type="number"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left font-sans"
                          placeholder="كم ربطة متوفرة"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">الوحدة الأساسية</label>
                        <select
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                          value={prodUnit}
                          onChange={(e) => setProdUnit(e.target.value)}
                        >
                          <option value="Rabta">ربطة (Rabta)</option>
                          <option value="Bag">كيس (Bag)</option>
                          <option value="KG">كيلو (KG)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">حد تنبيه انخفاض المخزون</label>
                        <input
                          type="number"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left font-sans"
                          value={prodMinStock}
                          onChange={(e) => setProdMinStock(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-4 flex justify-end gap-3 pt-3">
                        {editingProduct && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(null);
                              setProdNameAr("");
                              setProdNameEn("");
                              setProdBuyPrice("");
                              setProdSellPrice("");
                              setProdStock("");
                            }}
                            className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl cursor-pointer font-bold"
                          >
                            إلغاء التعديل
                          </button>
                        )}

                        <button
                          type="submit"
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold shadow cursor-pointer"
                        >
                          {editingProduct ? "تحديث بيانات الصنف" : "حفظ الصنف وتوريده"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products Inventory List */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-base">قائمة المخزون المتوفر لفرع المتجر</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                          <th className="pb-3">رقم الصنف</th>
                          <th className="pb-3">الاسم العربي</th>
                          <th className="pb-3">الفصيلة</th>
                          <th className="pb-3">الجودة</th>
                          <th className="pb-3">سعر الشراء</th>
                          <th className="pb-3">سعر البيع</th>
                          <th className="pb-3">المخزون الحالي</th>
                          <th className="pb-3 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {products.map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-3">#{p.id}</td>
                            <td className="py-3 font-extrabold text-slate-850">{p.nameAr}</td>
                            <td className="py-3">{p.varietyType}</td>
                            <td className="py-3">{p.grade}</td>
                            <td className="py-3 font-sans font-bold">{parseFloat(p.basePurchasePrice).toLocaleString()} YER</td>
                            <td className="py-3 font-sans font-bold text-emerald-800">{parseFloat(p.baseSalePrice).toLocaleString()} YER</td>
                            <td className="py-3">
                              <span className={`px-2.5 py-1 rounded-full font-bold ${
                                parseFloat(p.currentStock) <= parseFloat(p.minStockLevel)
                                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                                  : "bg-emerald-50 text-emerald-800"
                              }`}>
                                {p.currentStock} {p.unit}
                              </span>
                            </td>
                            <td className="py-3 text-center flex gap-2 justify-center">
                              {user?.role !== "cashier" && (
                                <>
                                  <button
                                    onClick={() => handleEditProductClick(p)}
                                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded font-bold cursor-pointer"
                                  >
                                    تعديل
                                  </button>
                                  {user?.role === "admin" && (
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-2 py-1 rounded font-bold cursor-pointer"
                                    >
                                      حذف
                                    </button>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CUSTOMERS & DEBTS */}
            {activeTab === "customers" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT PANEL: Register New Customer */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-fit">
                    <h3 className="font-bold text-slate-850 text-base">تسجيل عميل آجل جديد</h3>
                    <p className="text-xs text-slate-400">تقييد حساب دين مالي بسقوف ائتمانية لمراقبة وتتبع السحوبات اليومية</p>

                    <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs font-semibold">
                      <div>
                        <label className="block text-slate-600 mb-1.5">الاسم الرباعي الكامل</label>
                        <input
                          type="text"
                          required
                          className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl"
                          placeholder="مثال: القاضي محمد عبد الله العنسي"
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">رقم الهاتف النشط (للمطالبة بالدين)</label>
                        <input
                          type="text"
                          required
                          className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans"
                          placeholder="77xxxxxxx"
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">العنوان والسكن</label>
                        <input
                          type="text"
                          className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl"
                          placeholder="صنعاء، حي الروضة"
                          value={custAddress}
                          onChange={(e) => setCustAddress(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">سقف الدين الأقصى المسموح به (YER)</label>
                        <input
                          type="number"
                          className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans font-bold"
                          value={custDebtLimit}
                          onChange={(e) => setCustDebtLimit(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow cursor-pointer text-sm"
                      >
                        تسجيل وتأمين حساب العميل
                      </button>
                    </form>
                  </div>

                  {/* RIGHT PANEL: Debt payment form & list */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Pay Debt Form */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                        <Calculator className="w-5 h-5 text-emerald-600" />
                        استلام وتوريد سداد ديون عميل
                      </h3>

                      <form onSubmit={handleCustomerDebtPayment} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <label className="block text-slate-600 mb-1.5">اختر العميل المطالب</label>
                          <select
                            required
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl"
                            value={debtCustId}
                            onChange={(e) => setDebtCustId(e.target.value)}
                          >
                            <option value="">-- اختر من القائمة --</option>
                            {customers.map((c, idx) => (
                              <option key={idx} value={c.id}>
                                {c.name} (مديونية: {parseFloat(c.currentDebt).toLocaleString()} YER)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 mb-1.5">المبلغ المدفوع المسدد (YER)</label>
                          <input
                            type="number"
                            required
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans font-bold"
                            placeholder="المبلغ المدفوع نقداً"
                            value={debtAmount}
                            onChange={(e) => setDebtAmount(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 mb-1.5">ملاحظات السند / القيود</label>
                          <input
                            type="text"
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl"
                            placeholder="دفعة تسوية من الحساب الآجل"
                            value={debtNotes}
                            onChange={(e) => setDebtNotes(e.target.value)}
                          />
                        </div>

                        <div className="md:col-span-3 flex justify-end">
                          <button
                            type="submit"
                            disabled={submittingDebtPay}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow cursor-pointer text-xs"
                          >
                            {submittingDebtPay ? "جاري ترحيل الدفعة لميزانية الصندوق..." : "قيد ترحيل دفعة السداد النقدية"}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Customers Debt List */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm">كشف المديونيات المعلقة وسجل السقوف</h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400">
                              <th className="pb-3">العميل</th>
                              <th className="pb-3">الهاتف</th>
                              <th className="pb-3">العنوان</th>
                              <th className="pb-3">السقف الإئتماني</th>
                              <th className="pb-3">الدين المستحق</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {customers.map((c, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="py-3 font-bold text-slate-850">{c.name}</td>
                                <td className="py-3 font-sans">{c.phone}</td>
                                <td className="py-3">{c.address || "غير محدد"}</td>
                                <td className="py-3 font-sans font-bold">{parseFloat(c.maxDebtLimit).toLocaleString()} YER</td>
                                <td className="py-3">
                                  <span className={`px-2 py-1 rounded font-sans font-bold ${
                                    parseFloat(c.currentDebt) > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"
                                  }`}>
                                    {parseFloat(c.currentDebt).toLocaleString()} YER
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SUPPLIERS & CONSIGNMENTS */}
            {activeTab === "suppliers" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Register Supplier (Consignor) */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-fit">
                    <h3 className="font-bold text-slate-850 text-base">تسجيل مورد (مَقْوَت أمانات) جديد</h3>
                    <p className="text-xs text-slate-400">حصر حسابات التوريد وعمولات التداول للقات اليومي</p>

                    <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs font-semibold">
                      <div>
                        <label className="block text-slate-600 mb-1.5">اسم المورد</label>
                        <input
                          type="text"
                          required
                          className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl"
                          placeholder="الحاج علي المشرقي الهمداني"
                          value={suppName}
                          onChange={(e) => setSuppName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">رقم الهاتف الفوري</label>
                        <input
                          type="text"
                          required
                          className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans"
                          placeholder="77xxxxxxx"
                          value={suppPhone}
                          onChange={(e) => setSuppPhone(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">الالتزام النقدي الابتدائي للمورد (YER)</label>
                        <input
                          type="number"
                          className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans font-bold"
                          value={suppLiability}
                          onChange={(e) => setSuppLiability(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow cursor-pointer text-sm"
                      >
                        تسجيل المورد وحفظه
                      </button>
                    </form>
                  </div>

                  {/* Purchases, Supplies and Payment Registry */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Pay Supplier Form */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                        <Truck className="w-5 h-5 text-amber-600" />
                        صرف سند تسوية مستحقات مورد (أمانات)
                      </h3>

                      <form onSubmit={handleSupplierLiabilityPayment} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <label className="block text-slate-600 mb-1.5">اختر المورد المستحق</label>
                          <select
                            required
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl"
                            value={liabSuppId}
                            onChange={(e) => setLiabSuppId(e.target.value)}
                          >
                            <option value="">-- اختر المورد --</option>
                            {suppliers.map((s, idx) => (
                              <option key={idx} value={s.id}>
                                {s.name} (مستحق: {parseFloat(s.currentLiability).toLocaleString()} YER)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 mb-1.5">المبلغ المصروف المدفوع (YER)</label>
                          <input
                            type="number"
                            required
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans font-bold"
                            placeholder="مثال: 50000"
                            value={liabAmount}
                            onChange={(e) => setLiabAmount(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 mb-1.5">تبيين القيد وملاحظاته</label>
                          <input
                            type="text"
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl"
                            placeholder="تسوية دفعة مالية من حساب التوريد"
                            value={liabNotes}
                            onChange={(e) => setLiabNotes(e.target.value)}
                          />
                        </div>

                        <div className="md:col-span-3 flex justify-end">
                          <button
                            type="submit"
                            disabled={submittingLiabPay}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow cursor-pointer text-xs"
                          >
                            {submittingLiabPay ? "جاري ترحيل الحركة المالية وصرف النقد..." : "ترحيل الحركة وتخفيض التزامات المورد"}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Suppliers List */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm">كتاب الموردين وأرصدة الأمانات</h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400">
                              <th className="pb-3">المورد</th>
                              <th className="pb-3">الهاتف</th>
                              <th className="pb-3">الالتزام النقدي المستحق (YER)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {suppliers.map((s, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="py-3 font-bold text-slate-850">{s.name}</td>
                                <td className="py-3 font-sans">{s.phone}</td>
                                <td className="py-3">
                                  <span className={`px-2.5 py-1 rounded font-sans font-bold ${
                                    parseFloat(s.currentLiability) > 0 ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
                                  }`}>
                                    {parseFloat(s.currentLiability).toLocaleString()} YER
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SHIFT DRAWER RECONCILIATION */}
            {activeTab === "shifts" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Current Active Shift Reconcile */}
                  <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-base">إغلاق وتصفية صندوق الوردية الحالية</h3>
                    <p className="text-xs text-slate-400">حصر عهد درج النقود لمطابقة الإيراد بالمنصة مع النقد المالي الحقيقي وفحص العجز أو الفائض.</p>

                    {activeShift ? (
                      <div className="space-y-4 font-semibold text-xs text-slate-700">
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                          <div>
                            <span className="text-slate-400 block text-[10px]">الكاشير المسؤول:</span>
                            <span className="font-bold text-slate-800">{user.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">ساعة الفتح والبدء:</span>
                            <span className="font-sans font-bold">{new Date(activeShift.startTime).toLocaleTimeString("ar-YE")}</span>
                          </div>
                          <div className="mt-2.5">
                            <span className="text-slate-400 block text-[10px]">المبلغ الابتدائي بالصندوق:</span>
                            <span className="font-sans font-bold">{parseFloat(activeShift.startingCash).toLocaleString()} YER</span>
                          </div>
                          <div className="mt-2.5">
                            <span className="text-slate-400 block text-[10px]">المبلغ المتوقع الحسابي:</span>
                            <span className="font-sans font-bold text-emerald-800 text-sm">
                              {parseFloat(activeShift.expectedCash).toLocaleString()} YER
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-slate-600">المبلغ النقدي الفعلي الموجود بالصندوق (YER):</label>
                          <input
                            type="number"
                            required
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans font-bold text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="عد النقدية واكتب الإجمالي هنا"
                            value={actualCash}
                            onChange={(e) => setActualCash(e.target.value)}
                          />
                        </div>

                        {actualCash && (
                          <div className={`p-3 rounded-lg text-xs font-bold ${
                            parseFloat(actualCash) - parseFloat(activeShift.expectedCash) === 0
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-rose-50 text-rose-800"
                          }`}>
                            الفارق المحتسب فوراً: {(parseFloat(actualCash) - parseFloat(activeShift.expectedCash)).toLocaleString()} YER
                            {parseFloat(actualCash) - parseFloat(activeShift.expectedCash) < 0 ? " (عجز بالصندوق)" : parseFloat(actualCash) - parseFloat(activeShift.expectedCash) > 0 ? " (فائض نقدي)" : " (الدرج مطابق ومثالي)"}
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="block text-slate-600">تقرير الملاحظات النهائي والتسوية:</label>
                          <textarea
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs h-20"
                            placeholder="اكتب أي ملاحظة عن مبيعات الوردية اليوم..."
                            value={shiftNotes}
                            onChange={(e) => setShiftNotes(e.target.value)}
                          />
                        </div>

                        <button
                          onClick={() => handleShiftControl("close")}
                          disabled={submittingShift || !actualCash}
                          className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold py-3 rounded-xl shadow cursor-pointer text-sm"
                        >
                          {submittingShift ? "جاري تصفية الصندوق وتأمين الحساب..." : "تأكيد إغلاق الوردية نهائياً وترحيل القيود"}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center text-slate-500">
                        لا توجد وردية مفتوحة حالياً للكاشير.
                      </div>
                    )}
                  </div>

                  {/* Open New Shift */}
                  <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-base">فتح وردية عمل وصندوق بيع جديد</h3>
                    <p className="text-xs text-slate-400">عند استلام كاشير جديد للوردية، يجب تأمين العهدة لتوثيق فترات البيع بشكل منعزل كلياً عن الورديات الأخرى.</p>

                    {!activeShift ? (
                      <div className="space-y-4 font-semibold text-xs text-slate-700">
                        <div className="space-y-2">
                          <label className="block text-slate-600">المبلغ العهدة الافتتاحي بالصندوق (YER):</label>
                          <input
                            type="number"
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans font-bold"
                            value={startingCash}
                            onChange={(e) => setStartingCash(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-slate-600">ملاحظات تسلم الصندوق والعهدة:</label>
                          <textarea
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl h-20"
                            placeholder="تم تسلم الصندوق وتأكيده من الكاشير"
                            value={shiftNotes}
                            onChange={(e) => setShiftNotes(e.target.value)}
                          />
                        </div>

                        <button
                          onClick={() => handleShiftControl("open")}
                          disabled={submittingShift}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow cursor-pointer text-sm"
                        >
                          {submittingShift ? "جاري فتح الوردية..." : "ابدأ الوردية وافتح درج النقد للبيع"}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-150 text-center text-emerald-800">
                        الوردية المفتوحة نشطة حالياً مع الكاشير النشط. لا حاجة لفتح وردية جديدة حتى يتم إغلاق وتصفية الوردية الحالية.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: DAILY SPOILAGE TRACKER */}
            {activeTab === "spoilage" && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Spoilage Form */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-fit">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-850 text-base">تسجيل فاقد وتالف قات اليوم</h3>
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-100 animate-pulse">
                        القات سريع التلف (24 ساعة)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">تقييد كمية التالف المرمية بالكامل لتفادي الفوارق الغامضة للمخازن، أو تسجيل كمية محولة إلى بايت مخفض السعر.</p>

                    <form onSubmit={handleRecordSpoilage} className="space-y-4 text-xs font-semibold">
                      <div>
                        <label className="block text-slate-600 mb-1.5">اختر صنف القات المتأثر</label>
                        <select
                          required
                          className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl"
                          value={spoilProductId}
                          onChange={(e) => setSpoilProductId(e.target.value)}
                        >
                          <option value="">-- اختر الصنف --</option>
                          {products.map((p, idx) => (
                            <option key={idx} value={p.id}>
                              {p.nameAr} (متاح بالمخزن: {p.currentStock} {p.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 mb-1.5">كمية التالف المحذوفة (ربطة)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans font-bold"
                            placeholder="ستطرح من المخزن"
                            value={spoilQuantity}
                            onChange={(e) => setSpoilQuantity(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 mb-1.5">كمية البايت المخفضة</label>
                          <input
                            type="number"
                            step="0.1"
                            className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl text-left font-sans font-bold"
                            placeholder="كمية مركدة للمساء"
                            value={spoilMarkdownQty}
                            onChange={(e) => setSpoilMarkdownQty(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1.5">سبب التلف ومبرراته للرقابة الميدانية</label>
                        <textarea
                          className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl h-20"
                          placeholder="مثال: ذبلت البضاعة بسبب حرارة الشمس أثناء جولة تعز..."
                          value={spoilNotes}
                          onChange={(e) => setSpoilNotes(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingSpoilage}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl shadow cursor-pointer text-sm"
                      >
                        {submittingSpoilage ? "جاري ترحيل التلف وتسوية الصنف..." : "تأكيد تسجيل الفاقد من المخزن"}
                      </button>
                    </form>
                  </div>

                  {/* Recent Spoilage Logs List */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm">دفتر وسجل تالف وفاقد المخازن</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400">
                            <th className="pb-3">التاريخ واليوم</th>
                            <th className="pb-3">رقم الصنف</th>
                            <th className="pb-3">كمية التالف (إتلاف)</th>
                            <th className="pb-3">كمية البايت (تخفيض)</th>
                            <th className="pb-3">التقرير والسبب والبيان</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {spoilageLogs.map((log, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-3 font-sans">{new Date(log.date).toLocaleDateString("ar-YE")}</td>
                              <td className="py-3">#{log.productId}</td>
                              <td className="py-3 font-sans font-bold text-rose-600">{log.spoiledQuantity} ربطة</td>
                              <td className="py-3 font-sans font-bold text-amber-600">{log.markdownQuantity} ربطة</td>
                              <td className="py-3 text-slate-500 max-w-[200px] truncate">{log.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {spoilageLogs.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                          لا توجد قيود تالف مسجلة في الـ 24 ساعة الماضية
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: OFFLINE-FIRST FLUTTER MOBILE APP SIMULATOR */}
            {activeTab === "mobile_simulator" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-indigo-900 font-bold text-base flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-indigo-700" />
                      محاكي تطبيق الجوال Flutter لتدقيق التداول خارج نطاق التغطية
                    </h3>
                    <p className="text-xs text-indigo-700 mt-1">
                      يدعم التداول وحفظ المعاملات في قاعدة بيانات SQLite محلية، المزامنة المتكررة الإيدمبوتنت، تصفية الفواتير المعلقة، واكتشاف التعارضات.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsMobileOnline(!isMobileOnline);
                        logMobileEvent(`تعديل حالة الاتصال: الجوال الآن في وضع ${!isMobileOnline ? "متصل بالإنترنت (Wifi On)" : "منقطع عن التغطية (Wifi Off)"}`);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-2 cursor-pointer transition-all ${
                        isMobileOnline ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                      }`}
                    >
                      {isMobileOnline ? <Wifi className="w-4 h-4 animate-ping" /> : <WifiOff className="w-4 h-4" />}
                      {isMobileOnline ? "الإنترنت نشط (Wifi On)" : "الإنترنت معطل (Wifi Off)"}
                    </button>

                    <button
                      onClick={syncMobileTransactions}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      مزامنة الطابور الآن ({mobileQueue.length})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* MOBILE DEVICE MOCKUP UI */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-[310px] h-[610px] bg-slate-950 rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-800 relative flex flex-col">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-b-xl z-20"></div>

                      {/* Screen content */}
                      <div className="flex-1 bg-indigo-950 rounded-[28px] overflow-hidden p-3 flex flex-col justify-between text-white font-sans text-[11px] relative">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center text-[9px] text-indigo-200 mt-1.5 pb-2 border-b border-indigo-900">
                          <span className="font-sans font-bold">12:30 م</span>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span>Meqwat_v2.0</span>
                            {isMobileOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
                          </div>
                        </div>

                        {/* App Body inside Mobile */}
                        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-0.5">
                          {/* Active Tenant inside Mobile */}
                          <div className="bg-indigo-900/50 p-2 rounded-lg text-center border border-indigo-800">
                            <span className="text-[9px] text-indigo-300 block">تطبيق التداول الميداني</span>
                            <strong className="text-white text-xs">{tenant ? tenant.name : "غير مسجل"}</strong>
                          </div>

                          {/* Quick Add Product */}
                          <div>
                            <span className="text-[9px] text-indigo-300 font-bold block mb-1">انقر لإضافة قات لسلّة الهاتف:</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {products.map((p, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => addProductToMobileCart(p)}
                                  className="bg-indigo-900/80 hover:bg-indigo-800 p-2 rounded text-right border border-indigo-800 text-[10px] cursor-pointer"
                                >
                                  <strong className="text-white block truncate">{p.nameAr}</strong>
                                  <span className="text-emerald-400 font-sans text-[9px]">{parseFloat(p.baseSalePrice).toLocaleString()} YER</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Mini Mobile Cart */}
                          <div className="bg-indigo-900/30 p-2.5 rounded-xl border border-indigo-900/50 space-y-2">
                            <span className="text-[9px] text-indigo-300 font-bold block border-b border-indigo-900/50 pb-1">سلّة الجوال الحالية:</span>
                            {mobileCart.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[10px]">
                                <span className="truncate max-w-[120px]">{item.product.nameAr}</span>
                                <span className="font-sans">{item.quantity} ربطة</span>
                              </div>
                            ))}

                            {mobileCart.length === 0 && (
                              <div className="text-center py-4 text-indigo-300/40 text-[10px]">
                                السلة فارغة. اختر أصنافاً أعلاه للبيع الميداني
                              </div>
                            )}
                          </div>

                          {/* Customer Debt Select */}
                          <div className="space-y-1">
                            <span className="text-[9px] text-indigo-300 block">العميل (آجل):</span>
                            <select
                              className="w-full bg-indigo-900 border border-indigo-800 p-1 rounded text-white text-[10px]"
                              value={mobileCustomerId}
                              onChange={(e) => setMobileCustomerId(e.target.value)}
                            >
                              <option value="">-- نقدي مباشر --</option>
                              {customers.map((c, idx) => (
                                <option key={idx} value={c.id} className="bg-indigo-950">{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Mobile Checkout Footer */}
                        <div className="border-t border-indigo-900 pt-2 bg-indigo-950/90 space-y-2">
                          <button
                            onClick={handleMobileOfflineSale}
                            disabled={mobileCart.length === 0}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            حفظ الفاتورة محلياً (أوفلاين)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SIMULATOR EVENT LOGS */}
                  <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4 flex flex-col justify-between min-h-[500px]">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h4 className="text-slate-250 font-bold text-sm flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-indigo-400" />
                          سجلات المزامنة ووحدة التحكم في الوقت الحقيقي
                        </h4>
                        <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-1 rounded font-mono">
                          SQLite to Postgres Bridge
                        </span>
                      </div>

                      {/* Local Queue list */}
                      <div className="space-y-2">
                        <span className="text-xs text-slate-400 font-bold">المعاملات المخزنة محلياً بالجوال ولم ترحل للسيرفر بعد:</span>
                        {mobileQueue.map((tx, idx) => (
                          <div key={idx} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center text-xs">
                            <div>
                              <strong className="text-white block">{tx.customerName}</strong>
                              <span className="text-[10px] text-slate-400">كود التعريف: {tx.offlineUuid}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-amber-500 font-bold block">معلقة ({tx.paymentMethod})</span>
                              <span className="text-[10px] text-indigo-300 font-sans">{parseFloat(tx.paidAmount).toLocaleString()} YER مدفوع</span>
                            </div>
                          </div>
                        ))}

                        {mobileQueue.length === 0 && (
                          <div className="text-center py-6 text-slate-500 text-xs bg-slate-850 rounded-lg">
                            لا توجد معاملات معلقة في طابور SQLite حالياً.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Console Logger */}
                    <div className="space-y-2 pt-4 border-t border-slate-800">
                      <span className="text-xs text-slate-400 font-bold block">مخرجات نظام التداول المحمول (Console):</span>
                      <div className="bg-black/80 font-mono text-emerald-400 p-3 rounded-lg text-[10px] h-36 overflow-y-auto space-y-1 text-left select-none">
                        {syncLogs.map((log, idx) => (
                          <div key={idx} className="leading-relaxed">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: PLATFORM ADMIN & SaaS SUBSCRIPTIONS */}
            {activeTab === "saas_admin" && (
              <div className="space-y-6 animate-fade-in">
                {/* Create SaaS Tenant Isolated Workspace */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-850 text-base">إنشاء مساحة مستأجر isolated جديدة بنظام SaaS</h3>
                  <p className="text-xs text-slate-400">تقييد مساحات عمل منعزلة لقوانين حماية البيانات والخصوصية المشتركة لتجار ومحلات اليمن</p>

                  <form onSubmit={handleCreateTenantRequest} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-600 mb-1.5">اسم المؤسسة التجاري</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        placeholder="محل تعز لعمولة القات"
                        value={newTenantName}
                        onChange={(e) => setNewTenantName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1.5">اسم المالك الرئيسي</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        placeholder="أبو رعد الأصبحي"
                        value={newTenantOwner}
                        onChange={(e) => setNewTenantOwner(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1.5">رقم الهاتف الفوري للمالك</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left font-sans"
                        placeholder="77xxxxxxx"
                        value={newTenantPhone}
                        onChange={(e) => setNewTenantPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1.5">باقة الاشتراك</label>
                      <select
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                        value={newTenantPlan}
                        onChange={(e) => setNewTenantPlan(e.target.value)}
                      >
                        <option value="Basic">الباقة الأساسية (Basic) - 10$ شهرياً</option>
                        <option value="Pro">الباقة الاحترافية (Pro) - 25$ شهرياً</option>
                        <option value="Enterprise">المؤسسات الكبرى (Enterprise) - 60$ شهرياً</option>
                      </select>
                    </div>

                    <div className="md:col-span-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingTenantReq}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-2.5 rounded-xl shadow cursor-pointer text-xs"
                      >
                        {submittingTenantReq ? "جاري تهيئة خوادم العزل وقاعدة البيانات..." : "تأكيد الاشتراك وعزل المساحة"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* SaaS Tenants Dashboard */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-base">إدارة اشتراكات المستأجرين النشطة والرقابة</h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                          <th className="pb-3">كود المستأجر</th>
                          <th className="pb-3">الاسم التجاري للمؤسسة</th>
                          <th className="pb-3">المالك الفعلي</th>
                          <th className="pb-3">رقم الهاتف</th>
                          <th className="pb-3">باقة الاشتراك</th>
                          <th className="pb-3">حالة الحساب</th>
                          <th className="pb-3 text-center">التحكم والرقابة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {saasTenants.map((ten, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-3 font-sans">#00{ten.id}</td>
                            <td className="py-3 font-bold text-slate-850">{ten.name}</td>
                            <td className="py-3">{ten.ownerName}</td>
                            <td className="py-3 font-sans">{ten.phone}</td>
                            <td className="py-3">
                              <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded text-[10px] font-bold">
                                {ten.planName}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ten.subscriptionStatus === "active" ? "bg-emerald-50 text-emerald-800" :
                                ten.subscriptionStatus === "trial" ? "bg-indigo-50 text-indigo-800" : "bg-rose-50 text-rose-800"
                              }`}>
                                {ten.subscriptionStatus === "active" ? "نشط ومسدد" : ten.subscriptionStatus === "trial" ? "تجربة مجانية" : "معلق"}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => toggleTenantStatus(ten.id)}
                                className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                  ten.subscriptionStatus === "active" ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                {ten.subscriptionStatus === "active" ? "تعليق القيد" : "إلغاء التعليق"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* FOOTER BAR */}
      <footer className="bg-slate-900 text-slate-400 py-6 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div>
            <p className="font-bold text-slate-300">منصة ميقوات ساس (Meqwat SaaS) لبيع وتداول القات في اليمن والقرن الأفريقي</p>
            <p className="mt-1">جميع الحقوق محفوظة © {new Date().getFullYear()} - نظام سحابي معزول بالكامل بقاعدة البيانات</p>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> ممتثل لضوابط العزل المالي</span>
            <span className="flex items-center gap-1"><Wifi className="w-4 h-4 text-emerald-500" /> مرونة التداول الأوفلاين للجوال</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
