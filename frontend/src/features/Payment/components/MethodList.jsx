const MethodList = ({ onSelect }) => {
    const methods = [
        { id: 'vnpay', name: 'Thẻ ATM nội địa (VNPAY)', icon: 'https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAYQR-update.png' },
        { id: 'momo', name: 'Ví MoMo', icon: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' }
    ];

    return (
        <div style={{ border: '1px solid #ddd', padding: '15px' }}>
            <h3 style={{ color: '#00355a' }}><i className="fa fa-credit-card"></i> PHƯƠNG THỨC THANH TOÁN</h3>
            {methods.map(m => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                    <input type="radio" name="payment" onChange={() => onSelect(m.id)} style={{ marginRight: '10px' }} />
                    <img src={m.icon} alt={m.name} width="40" style={{ marginRight: '10px' }} />
                    {m.name}
                </label>
            ))}
        </div>
    );
};
export default MethodList;