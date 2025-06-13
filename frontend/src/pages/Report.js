import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet.js';
import Card from '../components/ui/Card.js';
import Button from '../components/ui/Button.js';
import { Upload, FileText, AlertTriangle, CheckCircle, Clock, Loader } from 'lucide-react';
import '../styles/pages/Report.css';

const Report = ({ reportTab = 'submit', reportTarget = null }) => {
    const { isConnected, walletInfo, updateBalance } = useWallet();
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [submissionRecords, setSubmissionRecords] = useState([]);
    
    const [reportForm, setReportForm] = useState({
        accountName: '',
        accountAddress: '',
        reportType: '',
        subject: '',
        detail: '',
        evidence: null,
        stakeAmount: 50,
        agreeToTerms: false
    });

    const reportTypes = [
        { value: 'purchase_frequency', label: '購票頻率異常（短時間大量購票）', stake: 50 },
        { value: 'device_fingerprint', label: '設備指紋異常（同一設備多帳號）', stake: 50 },
        { value: 'payment_pattern', label: '支付模式異常（相同支付方式多筆交易）', stake: 50 },
        { value: 'geo_location', label: '地理位置異常（IP地址與購票地點不符）', stake: 50 },
        { value: 'resale_behavior', label: '轉售行為異常（購票後立即高價掛售）', stake: 50 }
    ];

    // 載入提交記錄
    useEffect(() => {
        loadSubmissionRecords();
    }, []);

    // 當有預填數據時只填入 accountName 和 accountAddress，並根據來源設定合適的報告類型
    useEffect(() => {
        if (reportTarget) {
        setReportForm(prev => ({
            ...prev,
            accountName: reportTarget.accountName || '',
            accountAddress: reportTarget.accountAddress || '',
            // 如果是從二手市場來的，可以預設為轉售行為異常
            reportType: reportTarget.context === 'Reported from secondary market listing' ? 'resale_behavior' : '',
            stakeAmount: 50 // 統一質押金額
        }));
        }
    }, [reportTarget]);

    // 載入提交記錄
    const loadSubmissionRecords = () => {
        try {
        const savedRecords = JSON.parse(localStorage.getItem('userReports') || '[]');
        setSubmissionRecords(savedRecords);
        } catch (error) {
        console.error('Error loading submission records:', error);
        setSubmissionRecords([]);
        }
    };

    // 根據舉報類型獲取質押金額
    const getStakeAmountForType = (type) => {
        const reportType = reportTypes.find(rt => rt.value === type);
        return reportType ? reportType.stake : 50;
    };

    // 處理表單輸入變更
    const handleInputChange = (field, value) => {
        setReportForm(prev => ({
        ...prev,
        [field]: value
        // 移除質押金額自動更新邏輯，統一為 50 FLT
        }));
    };

    // 處理文件上傳
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        
        if (file.size > maxSize) {
            alert('File size must be less than 10MB');
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert('Only JPG, PNG, and PDF files are allowed');
            return;
        }
        
        setReportForm(prev => ({
            ...prev,
            evidence: file
        }));
        }
    };

    // 模擬質押交易
    const processStaking = async (amount) => {
        // 模擬區塊鏈交易延遲
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 生成模擬交易哈希
        const transactionHash = '0x' + Math.random().toString(16).substr(2, 64);
        
        // 更新錢包餘額 (扣除質押金額)
        const newFltBalance = walletInfo.fltBalance - amount;
        updateBalance(newFltBalance, walletInfo.ethBalance);
        
        return {
        success: true,
        transactionHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        gasUsed: Math.floor(Math.random() * 50000) + 21000
        };
    };

    // 處理報告提交
    const handleSubmitReport = async (e) => {
        e.preventDefault();
        
        // 表單驗證
        if (!reportForm.accountName || !reportForm.accountAddress || 
            !reportForm.reportType || !reportForm.subject || 
            !reportForm.detail || !reportForm.agreeToTerms) {
        setSubmitResult({
            success: false,
            message: 'Please fill in all required fields and agree to the terms'
        });
        return;
        }
        
        // 檢查餘額
        if (walletInfo.fltBalance < 50) {
        setSubmitResult({
            success: false,
            message: 'Insufficient FLT balance. You need 50 FLT to submit a report.'
        });
        return;
        }
        
        setSubmitting(true);
        setSubmitResult(null);
        
        try {
        // 執行質押交易
        const stakingResult = await processStaking(50);
        
        if (stakingResult.success) {
            // 創建新的提交記錄
            const newReport = {
            id: Date.now(),
            title: `${reportForm.accountName} - ${reportForm.subject}`,
            accountName: reportForm.accountName,
            accountAddress: reportForm.accountAddress,
            reportType: reportForm.reportType,
            subject: reportForm.subject,
            detail: reportForm.detail,
            evidence: reportForm.evidence ? reportForm.evidence.name : null,
            stakeAmount: 50,
            status: 'submitted',
            progress: 33,
            submittedAt: new Date().toISOString(),
            transactionHash: stakingResult.transactionHash,
            blockNumber: stakingResult.blockNumber,
            gasUsed: stakingResult.gasUsed,
            history: [
                { 
                status: 'submitted', 
                date: new Date().toLocaleDateString(), 
                completed: true,
                description: 'Report submitted and stake deposited'
                },
                { 
                status: 'under_review', 
                date: '', 
                completed: false,
                description: 'Community review in progress'
                },
                { 
                status: 'resolved', 
                date: '', 
                completed: false,
                description: 'Final decision and stake return/forfeit'
                }
            ]
            };
            
            // 保存到 localStorage
            const existingReports = JSON.parse(localStorage.getItem('userReports') || '[]');
            existingReports.unshift(newReport); // 新報告放在最前面
            localStorage.setItem('userReports', JSON.stringify(existingReports));
            
            // 更新本地狀態
            setSubmissionRecords(existingReports);
            
            // 顯示成功消息
            setSubmitResult({
            success: true,
            message: 'Report submitted successfully! 50 FLT has been staked.',
            reportId: newReport.id,
            transactionHash: stakingResult.transactionHash
            });
            
            // 重置表單
            setReportForm({
            accountName: '',
            accountAddress: '',
            reportType: '',
            subject: '',
            detail: '',
            evidence: null,
            stakeAmount: 50,
            agreeToTerms: false
            });
            
            // 3秒後清除結果消息
            setTimeout(() => {
            setSubmitResult(null);
            }, 5000);
            
        } else {
            throw new Error('Staking transaction failed');
        }
        
        } catch (error) {
        console.error('Error submitting report:', error);
        setSubmitResult({
            success: false,
            message: `Failed to submit report: ${error.message}`
        });
        } finally {
        setSubmitting(false);
        }
    };

    // 模擬審核進度更新功能已移除

    if (!isConnected) {
        return (
        <div className="report">
            <div className="report-header">
            <h1>Report</h1>
            </div>
            <div className="connect-wallet-prompt">
            <h2>Connect your wallet to submit reports</h2>
            <p>Please connect your wallet to access the reporting system.</p>
            </div>
        </div>
        );
    }

    return (
        <div className="report">
        <div className="report-header">
            <h1>Report</h1>
            <p className="report-subtitle">
            {reportTab === 'submit' 
                ? 'Submit a new report to help maintain platform integrity' 
                : 'Track your submitted reports and their status'
            }
            </p>
        </div>

        {/* Submit Report Tab */}
        {reportTab === 'submit' && (
            <div className="submit-report">
            <Card className="report-form-card">
                <h2>Submit a Report</h2>
                <p className="form-description">
                Report suspicious behavior or violations. A stake is required to ensure serious reporting.
                </p>

                {/* Current Balance Display */}
                <div className="balance-info">
                <h3>Your Current Balance</h3>
                <div className="balance-display">
                    <span className="balance-amount">{walletInfo.fltBalance.toLocaleString()} FLT</span>
                    <span className="balance-label">Available Balance</span>
                </div>
                </div>

                {/* Submit Result */}
                {submitResult && (
                <div className={`submit-result ${submitResult.success ? 'success' : 'error'}`}>
                    <div className="result-icon">
                    {submitResult.success ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div className="result-content">
                    <p className="result-message">{submitResult.message}</p>
                    {submitResult.success && submitResult.transactionHash && (
                        <p className="transaction-info">
                        Report ID: #{submitResult.reportId}<br />
                        Transaction: {submitResult.transactionHash.slice(0, 10)}...
                        </p>
                    )}
                    </div>
                </div>
                )}

                <form onSubmit={handleSubmitReport} className="report-form">
                {/* Account Information */}
                <div className="form-section">
                    <h3>Account Information</h3>
                    <p className="section-subtitle">(person who is reported)</p>
                    
                    <div className="form-group">
                    <label htmlFor="accountName">Account Name *</label>
                    <input
                        type="text"
                        id="accountName"
                        value={reportForm.accountName}
                        onChange={(e) => handleInputChange('accountName', e.target.value)}
                        placeholder="Enter account name"
                        required
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="accountAddress">Account Address *</label>
                    <input
                        type="text"
                        id="accountAddress"
                        value={reportForm.accountAddress}
                        onChange={(e) => handleInputChange('accountAddress', e.target.value)}
                        placeholder="0x..."
                        required
                    />
                    </div>
                </div>

                {/* Report Details */}
                <div className="form-section">
                    <h3>Report Details</h3>
                    
                    <div className="form-group">
                    <label htmlFor="reportType">Select Report Type *</label>
                    <select
                        id="reportType"
                        value={reportForm.reportType}
                        onChange={(e) => handleInputChange('reportType', e.target.value)}
                        required
                    >
                        <option value="">Select Report Type</option>
                        {reportTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                        ))}
                    </select>
                    <small>All report types require 50 FLT stake</small>
                    </div>

                    <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                        type="text"
                        id="subject"
                        value={reportForm.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief description of the issue"
                        required
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="detail">Detail *</label>
                    <textarea
                        id="detail"
                        value={reportForm.detail}
                        onChange={(e) => handleInputChange('detail', e.target.value)}
                        placeholder="Detailed description of the issue"
                        rows={6}
                        required
                    />
                    </div>
                </div>

                {/* Evidence Upload */}
                <div className="form-section">
                    <h3>Evidence (Optional)</h3>
                    
                    <div className="upload-area">
                    <div className="upload-zone">
                        <Upload size={48} className="upload-icon" />
                        <h4>Upload Evidence</h4>
                        <p>Drag and drop files here, or browse to upload.</p>
                        <p className="upload-info">
                        Accepted formats: JPG, PNG, PDF. Max file size: 10MB.
                        </p>
                        <input
                        type="file"
                        id="evidenceFile"
                        onChange={handleFileUpload}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="file-input"
                        />
                        <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('evidenceFile').click()}
                        >
                        Browse Files
                        </Button>
                    </div>
                    
                    {reportForm.evidence && (
                        <div className="uploaded-file">
                        <FileText size={20} />
                        <span>{reportForm.evidence.name}</span>
                        <button
                            type="button"
                            onClick={() => handleInputChange('evidence', null)}
                            className="remove-file"
                        >
                            ×
                        </button>
                        </div>
                    )}
                    </div>
                </div>

                {/* Stake and Agreement */}
                <div className="form-section">
                    <div className="stake-section">
                    <div className="stake-info">
                        <AlertTriangle size={20} className="stake-icon" />
                        <div className="stake-details">
                        <span className="stake-amount">Stake 50 FLT tokens</span>
                        <span className="stake-balance">
                            (Your balance: {walletInfo.fltBalance.toLocaleString()} FLT)
                        </span>
                        </div>
                    </div>
                    <p className="stake-description">
                        Staking tokens ensures serious reporting. Tokens will be returned if the report is valid. 
                        False reports will result in forfeiture of staked tokens.
                    </p>
                    
                    {walletInfo.fltBalance < 50 && (
                        <div className="insufficient-balance-warning">
                        <AlertTriangle size={16} />
                        <span>Insufficient balance for report submission</span>
                        </div>
                    )}
                    </div>

                    <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={reportForm.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        required
                    />
                    <label htmlFor="agreeToTerms">
                        I agree to the reporting terms and understand that false reports may result in loss of staked tokens
                    </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    disabled={
                        submitting || 
                        !reportForm.agreeToTerms || 
                        walletInfo.fltBalance < 50 ||
                        !reportForm.accountName ||
                        !reportForm.accountAddress ||
                        !reportForm.reportType ||
                        !reportForm.subject ||
                        !reportForm.detail
                    }
                    className="btn-submit-report"
                    >
                    {submitting && <Loader size={16} className="spinner" />}
                    {submitting ? 'Processing...' : 'Submit Report & Stake 50 FLT'}
                    </Button>
                </div>
                </form>
            </Card>
            </div>
        )}

        {/* Submission Records Tab */}
        {reportTab === 'records' && (
            <div className="submission-records">
            <div className="records-header">
                <h2>Submission Records</h2>
                <p className="records-description">
                Track the status and progress of your submitted reports.
                </p>
                {submissionRecords.length > 0 && (
                <div className="records-stats">
                    <span>Total Reports: {submissionRecords.length}</span>
                    <span>Pending: {submissionRecords.filter(r => r.status !== 'resolved').length}</span>
                    <span>Resolved: {submissionRecords.filter(r => r.status === 'resolved').length}</span>
                </div>
                )}
            </div>
            
            {submissionRecords.length > 0 ? (
                <div className="records-list">
                {submissionRecords.map((record) => (
                    <SubmissionRecord 
                    key={record.id} 
                    record={record}
                    />
                ))}
                </div>
            ) : (
                <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No submission records</h3>
                <p>You haven't submitted any reports yet.</p>
                </div>
            )}
            </div>
        )}
        </div>
    );
    };

    // Submission Record Component
    const SubmissionRecord = ({ record }) => {
    const getStatusIcon = (status) => {
        switch (status) {
        case 'submitted':
            return <FileText size={20} />;
        case 'under_review':
            return <Clock size={20} />;
        case 'resolved':
            return <CheckCircle size={20} />;
        default:
            return <FileText size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
        case 'submitted':
            return 'status-submitted';
        case 'under_review':
            return 'status-review';
        case 'resolved':
            return 'status-resolved';
        default:
            return 'status-submitted';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Card className="submission-record">
        <div className="record-header">
            <div className="record-title-section">
            <h3>#{record.id}</h3>
            <h4>{record.title}</h4>
            </div>
            <span className={`status-badge ${getStatusColor(record.status)}`}>
            {record.status.replace('_', ' ').toUpperCase()}
            </span>
        </div>

        <div className="record-details">
            <div className="detail-grid">
            <div className="detail-item">
                <span className="label">Report Type:</span>
                <span className="value">{record.reportType}</span>
            </div>
            <div className="detail-item">
                <span className="label">Staked:</span>
                <span className="value">{record.stakeAmount} FLT</span>
            </div>
            <div className="detail-item">
                <span className="label">Submitted:</span>
                <span className="value">{formatDate(record.submittedAt)}</span>
            </div>
            {record.transactionHash && (
                <div className="detail-item">
                <span className="label">Transaction:</span>
                <span className="value hash-link" 
                        onClick={() => window.open(`https://etherscan.io/tx/${record.transactionHash}`, '_blank')}>
                    {record.transactionHash.slice(0, 10)}...
                </span>
                </div>
            )}
            </div>
        </div>

        <div className="progress-section">
            <h4>Progress Tracking</h4>
            <div className="progress-bar-container">
            <div className="progress-label">Report Progress</div>
            <div className="progress-bar">
                <div 
                className="progress-fill"
                style={{ width: `${record.progress}%` }}
                ></div>
            </div>
            <div className="progress-percentage">{record.progress}%</div>
            </div>
        </div>

        <div className="history-section">
            <h4>Report History</h4>
            <div className="history-timeline">
            {record.history.map((item, index) => (
                <div key={index} className={`timeline-item ${item.completed ? 'completed' : 'pending'}`}>
                <div className="timeline-icon">
                    {getStatusIcon(item.status)}
                </div>
                <div className="timeline-content">
                    <h5 className={getStatusColor(item.status)}>
                    {item.status === 'submitted' && 'Report Submitted'}
                    {item.status === 'under_review' && 'Under Review'}
                    {item.status === 'resolved' && 'Resolved'}
                    </h5>
                    <p className="timeline-description">{item.description}</p>
                    <p className="timeline-date">{item.date || 'Pending'}</p>
                </div>
                </div>
            ))}
            </div>
        </div>
        </Card>
    );
};

export default Report;