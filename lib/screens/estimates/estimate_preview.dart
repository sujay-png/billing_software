import 'package:flutter/material.dart';

void main() {
  runApp(const MaterialApp(
    home: EstimatePreview(estimateId: "EST-2024-0892"),
    debugShowCheckedModeBanner: false,
  ));
}

class EstimatePreview extends StatelessWidget {
  final String estimateId;

  const EstimatePreview({super.key, required this.estimateId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // Light grey background
      body: Column(
        children: [
          _buildTopActionBar(context),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Center(
                child: _buildMainDocument(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Top Action Bar ---
  Widget _buildTopActionBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Row(
        children: [
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("ESTIMATE PREVIEW", 
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
              Text("#EST-2024-0892", 
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          const Spacer(),
          _buildActionButton(Icons.edit_outlined, "Edit"),
          const SizedBox(width: 12),
          _buildActionButton(Icons.picture_as_pdf_outlined, "Print to PDF"),
          const SizedBox(width: 12),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.send_outlined, size: 18),
            label: const Text("Send Estimate", style: TextStyle(fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF97316),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return OutlinedButton.icon(
      onPressed: () {},
      icon: Icon(icon, size: 18, color: Colors.blueGrey),
      label: Text(label, style: const TextStyle(color: Colors.blueGrey)),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  // --- The Centered Document ---
  Widget _buildMainDocument() {
    return Container(
      width: 800, // Fixed width for document look
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            spreadRadius: 5,
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Orange Top Border
          Container(height: 6, decoration: const BoxDecoration(color: Color(0xFFF97316))),
          
          Padding(
            padding: const EdgeInsets.all(60.0), // Generous document padding
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDocHeader(),
                const SizedBox(height: 60),
                _buildBillToSection(),
                const SizedBox(height: 60),
                _buildLineItemsTable(),
                const SizedBox(height: 40),
                _buildTotalsSection(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Mock Logo
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Icon(Icons.architecture, color: Colors.white, size: 24),
            ),
            const SizedBox(height: 12),
            const Text("DesignCore Studio LLC", style: TextStyle(fontWeight: FontWeight.bold)),
            const Text("123 Creative Avenue, Suite 100\nSan Francisco, CA 94107", 
              style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text("ESTIMATE", style: TextStyle(fontSize: 32, letterSpacing: 1.5, color: Color(0xFF94A3B8))),
            SizedBox(height: 8),
            Text("Date: October 12, 2023", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            Text("Estimate #: EST-2024-0892", style: TextStyle(fontSize: 13, color: Colors.grey)),
            Text("Reference: Project Aurora", style: TextStyle(fontSize: 13, color: Colors.grey)),
          ],
        )
      ],
    );
  }

  Widget _buildBillToSection() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("BILL TO:", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFF97316))),
            SizedBox(height: 8),
            Text("Starlight Ventures Inc.", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text("Attn: Sarah Jenkins\n458 Market St, Floor 12\nSan Francisco, CA 94105", 
              style: TextStyle(fontSize: 13, color: Colors.grey, height: 1.5)),
          ],
        ),
        SizedBox(
          width: 250,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text("PROJECT SUMMARY:", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFF97316))),
              const SizedBox(height: 8),
              Text(
                "Full-scale brand identity overhaul including typography, color systems, and digital assets for the 2024 launch.",
                textAlign: TextAlign.right,
                style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.grey.shade700, height: 1.5),
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildLineItemsTable() {
    return Column(
      children: [
        // Table Header
        Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: Colors.black, width: 1.5)),
          ),
          child: const Row(
            children: [
              Expanded(flex: 4, child: Text("ITEM DESCRIPTION", style: _tableHeaderStyle)),
              Expanded(child: Text("QTY", textAlign: TextAlign.center, style: _tableHeaderStyle)),
              Expanded(child: Text("RATE", textAlign: TextAlign.center, style: _tableHeaderStyle)),
              Expanded(child: Text("AMOUNT", textAlign: TextAlign.right, style: _tableHeaderStyle)),
            ],
          ),
        ),
        // Rows
        _buildItemRow("Brand Identity Discovery", "Market research, competitor analysis, and brand positioning workshop.", "1", "\$2,500.00", "\$2,500.00"),
        _buildItemRow("Logo Design & Development", "3 concepts, 2 rounds of revision, final vector export for web/print.", "1", "\$4,200.00", "\$4,200.00"),
        _buildItemRow("UI/UX Component Library", "Comprehensive Figma Library for mobile and desktop applications.", "40", "\$120.00", "\$4,800.00"),
      ],
    );
  }

  Widget _buildItemRow(String title, String desc, String qty, String rate, String amount) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade100)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 4,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 4),
                Text(desc, style: TextStyle(fontSize: 12, color: Colors.grey.shade600, height: 1.4)),
              ],
            ),
          ),
          Expanded(child: Text(qty, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14))),
          Expanded(child: Text(rate, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14))),
          Expanded(child: Text(amount, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14))),
        ],
      ),
    );
  }

  Widget _buildTotalsSection() {
    return Align(
      alignment: Alignment.centerRight,
      child: SizedBox(
        width: 250,
        child: Column(
          children: [
            _totalRow("Subtotal", "\$11,500.00"),
            const SizedBox(height: 8),
            _totalRow("Tax (8.5%)", "\$977.50"),
            const Divider(height: 32),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("Total", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text("\$12,477.50", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFFF97316))),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _totalRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }

  static const _tableHeaderStyle = TextStyle(fontSize: 11, fontWeight: FontWeight.bold);
}