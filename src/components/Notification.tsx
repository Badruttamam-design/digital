import React, { useEffect, useState } from 'react';

interface NotificationProps {
    message: string;
    type: 'info' | 'warning' | 'location';
    visible: boolean;
    onHide?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, visible, onHide }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (visible) {
            setShow(true);
            if (type === 'location') {
                const timer = setTimeout(() => {
                    setShow(false);
                    if (onHide) onHide();
                }, 3000);
                return () => clearTimeout(timer);
            }
        } else {
            setShow(false);
        }
    }, [visible, type, onHide]);

    if (!show) return null;

    const className = type === 'location'
        ? 'location-notification show'
        : 'countdown-notification show pulse';

    return (
        <div className={className}>
            {message}
        </div>
    );
};

export default Notification;
