'use client';
import { useEffect, useState } from "react";

export default function DepositForm({ selectedDeposit, refetchDeposits, setOpen }) {
    const [date, setDate] = useState(""); 
    const [note, setNote] = useState("");
    const [amount, setAmount] = useState("");
    const [place, setPlace] = useState(""); // State for selected place
    const [isHandHandling, setIsHandHandling] = useState(false); // Checkbox for hand handling
    const [nameHandler, setNameHandler] = useState(""); // Field for handler's name

    // List of branches for the dropdown
    const branches = [
        "فرع الرصيفة",
        "فرع شارع مكة",
        "فرع اتوستراد ماركا",
        "فرع ابو علندا",
        "فرع حي الرونق",
        "فرع مرج الحمام",
        "فرع خلدا",
        "فرع جبل عمان",
        "فرع جبل الحسين",
        "فرع الإستقلال مول",
        "فرع إربد سيتي سنتر",
        "فرع دابوق",
        "فرع الشميساني",
        "فرع الخالدي",
        "فرع الجبيهة",
        "فرع الجاردنز",
        "فرع البيادر",
        "فرع أبو نصير",
        "فرع العبدلي",
        "فرع الكرك",
        "فرع المدينة الرياضية",

        
    ];

    useEffect(() => {
        if (selectedDeposit) {
            setDate(selectedDeposit.date.split('T')[0]); 
            setNote(selectedDeposit.note);
            setAmount(selectedDeposit.amount);
            setPlace(selectedDeposit.place); // Set place from selected deposit
            setIsHandHandling(selectedDeposit.is_hand_handing); // Set checkbox state
            setNameHandler(selectedDeposit.name_handler); // Set handler's name
        }
    }, [selectedDeposit]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("/api/deposits", {
            method: selectedDeposit ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: selectedDeposit?.id,
                date,
                note,
                amount,
                place, // Include place in the body
                is_hand_handing: isHandHandling, // Include checkbox value
                name_handler: isHandHandling ? nameHandler : "", // Include handler's name if checked
            }),
        });

        if (response.ok) {
            setDate("");
            setNote("");
            setAmount("");
            setPlace(""); // Reset place
            setIsHandHandling(false); // Reset checkbox
            setNameHandler(""); // Reset handler's name
            setOpen(false);
            refetchDeposits(); // Updated refetch method
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Picker */}
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    التاريخ
                </label>
                <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            {/* Note field */}
            <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                    ملاحظات
                </label>
                <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            {/* Amount field */}
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    القيمة
                </label>
                <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            {/* Place Dropdown */}
            <div>
                <label htmlFor="place" className="block text-sm font-medium text-gray-700">
                    مكان الايداع
                </label>
                <select
                    id="place"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">اختر الفرع</option>
                    {branches.map((branch, index) => (
                        <option key={index} value={branch}>
                            {branch}
                        </option>
                    ))}
                </select>
            </div>

            {/* Hand Handling Checkbox */}
            <div className="flex items-center">
                <input
                    id="isHandHandling"
                    type="checkbox"
                    checked={isHandHandling}
                    onChange={(e) => setIsHandHandling(e.target.checked)}
                    className="mr-2"
                />
                <label htmlFor="isHandHandling" className="text-sm font-medium text-gray-700">
                    ايداع يدوي؟
                </label>
            </div>

            {/* Name Handler field */}
            {isHandHandling && (
                <div>
                    <label htmlFor="nameHandler" className="block text-sm font-medium text-gray-700">
                        اسم المستلم
                    </label>
                    <input
                        id="nameHandler"
                        type="text"
                        value={nameHandler}
                        onChange={(e) => setNameHandler(e.target.value)}
                        placeholder="Enter handler's name"
                        required={isHandHandling} // Make required if checked
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            )}

            {/* Submit button */}
            <div>
                <button
                    type="submit"
                    className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${selectedDeposit ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${selectedDeposit ? 'orange-500' : 'indigo-500'}`}
                >
                    {selectedDeposit ? "تعديل" : "اضافة"}
                </button>
            </div>
        </form>
    );
}
