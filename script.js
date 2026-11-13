
const KEY = "dompetMahasiswa";

let transactions = JSON.parse(
    localStorage.getItem(KEY) || "[]"
);

const form = document.getElementById("transactionForm");
const list = document.getElementById("transactionList");

document.getElementById("date").value =
    new Date().toLocaleDateString("en-CA");

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}

function saveData() {
    localStorage.setItem(
        KEY,
        JSON.stringify(transactions)
    );
}

function updateSummary() {
    let income = 0;
    let expense = 0;

    transactions.forEach(item => {
        if (item.type === "income") {
            income += item.amount;
        } else {
            expense += item.amount;
        }
    });

    document.getElementById("balance").textContent =
        formatRupiah(income - expense);

    document.getElementById("incomeTotal").textContent =
        formatRupiah(income);

    document.getElementById("expenseTotal").textContent =
        formatRupiah(expense);
}

function renderTransactions() {
    const search = document.getElementById("search")
        .value.toLowerCase();

    list.innerHTML = "";

    const filtered = transactions.filter(item =>
        (item.title + " " + item.category)
        .toLowerCase().includes(search)
    );

    document.getElementById("emptyState").style.display =
        filtered.length === 0 ? "block" : "none";

    filtered.forEach(item => {
        const div = document.createElement("div");
        div.className = "transaction";

        const info = document.createElement("div");
        info.className = "transaction-info";

        const title = document.createElement("strong");
        title.textContent = item.title;

        const detail = document.createElement("small");
        detail.textContent =
            item.category + " • " + item.date;

        info.append(title, detail);

        const money = document.createElement("span");
        money.className = "money " +
            (item.type === "income" ? "positive" : "negative");

        money.textContent =
            (item.type === "income" ? "+" : "-") +
            formatRupiah(item.amount);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Hapus";

        deleteButton.addEventListener("click", () => {
            if (confirm("Hapus transaksi ini?")) {
                transactions = transactions.filter(
                    t => t.id !== item.id
                );

                saveData();
                renderTransactions();
                updateSummary();
            }
        });

        div.append(info, money, deleteButton);
        list.appendChild(div);
    });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("title")
        .value.trim();

    const amount = Number(
        document.getElementById("amount").value
    );

    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!title || amount <= 0 || !date) {
        alert("Mohon isi data transaksi dengan benar!");
        return;
    }

    const transaction = {
        id: Date.now(),
        title: title,
        amount: amount,
        type: type,
        category: category,
        date: date
    };

    transactions.unshift(transaction);

    saveData();
    form.reset();

    document.getElementById("date").value =
        new Date().toLocaleDateString("en-CA");

    renderTransactions();
    updateSummary();

    alert("Transaksi berhasil disimpan!");
});

document.getElementById("search")
    .addEventListener("input", renderTransactions);

document.getElementById("clearBtn")
    .addEventListener("click", function() {

        if (transactions.length === 0) {
            alert("Belum ada data transaksi.");
            return;
        }

        if (confirm("Yakin ingin menghapus semua transaksi?")) {
            transactions = [];
            saveData();
            renderTransactions();
            updateSummary();
        }
    });

document.getElementById("exportBtn")
    .addEventListener("click", function() {

        if (transactions.length === 0) {
            alert("Belum ada data untuk diunduh.");
            return;
        }

        const rows = [
            ["Nama", "Jumlah", "Jenis", "Kategori", "Tanggal"]
        ];

        transactions.forEach(item => {
            rows.push([
                item.title,
                item.amount,
                item.type,
                item.category,
                item.date
            ]);
        });

        const csv = rows.map(row =>
            row.map(value =>
                '"' + String(value).replace(/"/g, '""') + '"'
            ).join(",")
        ).join("\n");

        const blob = new Blob(
            ["\uFEFF" + csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "laporan-keuangan-mahasiswa.csv";
        link.click();

        URL.revokeObjectURL(url);
    });

// Menjalankan aplikasi pertama kali
renderTransactions();
updateSummary();
