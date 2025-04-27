import { PencilLine, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { ITransactionLogs, listTransactions } from "../store/transactionSlice";
import { useAppDispatch, useAppSelector } from "../hooks/slice-hooks";
import { RootState } from "../store";

const TransactionLogs = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const dispatch = useAppDispatch();
    const { transactions, loading } = useAppSelector((state: RootState) => state.transactions);

    useEffect(() => {
        dispatch(listTransactions({ page: currentPage.toString(), limit: "5" }));
    }, [dispatch, currentPage]);

    useEffect(() => {
        if (!loading) setIsLoadingMore(false);
    });

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        setCurrentPage((prev) => prev + 1); // Update page locally
    };

    return (
        <div className="card">
            <div className="card-header">
                <p className="card-title">Transactions</p>
            </div>
            <div className="card-body p-0">
                <div className="relative h-[500px] w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
                    <table className="table">
                        <thead className="table-header">
                            <tr className="table-row">
                                <th className="table-head">Date</th>
                                <th className="table-head">Narration</th>
                                <th className="table-head">Notes</th>
                                <th className="table-head">Category</th>
                                <th className="table-head">Labels</th>
                                <th className="table-head">Amount</th>
                                <th className="table-head">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-body relative">
                            {/* Initial loading (first page) - Full table loader */}
                            {loading && (
                                <tr className="absolute inset-0 flex items-center justify-center bg-white/70">
                                    <td
                                        colSpan={7}
                                        className="flex items-center justify-center py-20"
                                    >
                                        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-600"></div>
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                transactions.map((item: ITransactionLogs, i) => (
                                    <tr
                                        key={i}
                                        className="table-row"
                                    >
                                        <td className="table-cell">{item?.transactionDate}</td>
                                        <td className="table-cell max-w-[600px] whitespace-normal break-words">{item.narration}</td>
                                        <td className="table-cell">{item?.notes || ""}</td>
                                        <td className="table-cell">{item?.category || ""}</td>
                                        <td className="table-cell">{item?.label}</td>
                                        <td className="table-cell">{item?.amount}</td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-x-4">
                                                <button className="text-blue-500 dark:text-blue-600">
                                                    <PencilLine size={20} />
                                                </button>
                                                <button className="text-red-500">
                                                    <Trash size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            {/* Load More Button */}
                            {!loading && (
                                <tr className="table-row">
                                    <td
                                        colSpan={7}
                                        className="table-cell py-4 text-center"
                                    >
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoadingMore}
                                            className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg active:scale-95"
                                        >
                                            {isLoadingMore && <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-white"></div>}
                                            {isLoadingMore ? "Loading..." : "Load More"}
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionLogs;
