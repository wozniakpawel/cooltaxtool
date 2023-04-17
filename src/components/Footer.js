import React from 'react';
import '../App.css';

const Footer = () => {
    return (
        <footer className="footer">
            <p>
                This website does not provide financial advice, and the calculations might be innacurate. Please consult a tax advisor before making any financial decisions.
            </p>
            <p>
                This is an open source project, feel free to contribute: {' '}
                <a href="https://github.com/wozniakpawel/cooltaxtool" target="_blank" rel="noopener noreferrer">
                    https://github.com/wozniakpawel/cooltaxtool
                </a>
            </p>
        </footer>
    );
};

export default Footer;
