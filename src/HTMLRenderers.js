import React from 'react';
import { TouchableOpacity, Text, View, Platform } from 'react-native';
import { RkText } from 'react-native-ui-kitten';
import { _constructStyles, _getElementClassStyles } from './HTMLStyles';
import HTMLImage from './HTMLImage';

export function a (htmlAttribs, children, convertedCSSStyles, passProps) {
    const style = _constructStyles({
        tagName: 'a',
        htmlAttribs,
        passProps,
        styleSet: passProps.parentWrapper === 'Text' ? 'TEXT' : 'VIEW'
    });
    // !! This deconstruction needs to happen after the styles construction since
    // the passed props might be altered by it !!
    const { parentWrapper, onLinkPress, key, data } = passProps;
    const onPress = evt =>
        onLinkPress && htmlAttribs && htmlAttribs.href ?
            onLinkPress(evt, htmlAttribs.href, htmlAttribs) :
            undefined;

    if (parentWrapper === 'Text') {
        return (
            <RkText
                rkType='basic'
                {...passProps}
                style={style}
                onPress={onPress}
                key={key}
            >
                {children || data}
            </RkText>
        );
    } else {
        return (
            <TouchableOpacity onPress={onPress} key={key}>
                {children || data}
            </TouchableOpacity>
        );
    }
}

export function img (htmlAttribs, children, convertedCSSStyles, passProps = {}) {
    if (!htmlAttribs.src) {
        return false;
    }

    const style = _constructStyles({
        tagName: 'img',
        htmlAttribs,
        passProps,
        styleSet: 'IMAGE'
    });
    const { src, alt, width, height } = htmlAttribs;
    return (
        <HTMLImage
            source={{ uri: src, cache: 'force-cache' }}
            alt={alt}
            width={width}
            height={height}
            style={style}
            {...passProps}
        />
    );
}

export function ul (htmlAttribs, children, convertedCSSStyles, passProps = {}) {
    const style = _constructStyles({
        tagName: 'ul',
        htmlAttribs,
        passProps,
        styleSet: 'VIEW'
    });
    const {
        allowFontScaling,
        rawChildren,
        nodeIndex,
        key,
        baseFontStyle,
        listsPrefixesRenderers
    } = passProps;
    const baseFontSize = baseFontStyle.fontSize || 16;

    let i = 0;

    children =
        children &&
        children.map((child, index) => {
            const rawChild = rawChildren[index];
            let prefix = false;
            const rendererArgs = [
                htmlAttribs,
                children,
                convertedCSSStyles,
                {
                    ...passProps,
                    index
                }
            ];

            if (rawChild) {
                if (rawChild.parentTag === 'ul' && rawChild.tagName === 'li') {
                    prefix =
                        listsPrefixesRenderers && listsPrefixesRenderers.ul ? (
                            listsPrefixesRenderers.ul(...rendererArgs)
                        ) : (
                            <View
                                style={{
                                    marginRight: 5,
                                    width: baseFontSize / 2.8,
                                    height: baseFontSize / 2.8,
                                    marginTop: baseFontSize / 2,
                                    borderRadius: baseFontSize / 2.8,
                                    backgroundColor: 'black'
                                }}
                            />
                        );
                } else if (
                    rawChild.parentTag === 'ol' &&
                    rawChild.tagName === 'li'
                ) {
                    i += 1;
                    prefix =
                        listsPrefixesRenderers && listsPrefixesRenderers.ol ? (
                            listsPrefixesRenderers.ol(...rendererArgs)
                        ) : (
                            <RkText
                                rkType='basic'
                                allowFontScaling={allowFontScaling}
                                style={{
                                    marginRight: 5,
                                    fontSize: baseFontSize
                                }}
                            >
                                {i}.
                            </RkText>
                        );
                }
            }
            if (
                (rawChild.tagName === 'ol' && rawChild.parentTag === 'ol') ||
                (rawChild.tagName === 'ul' && rawChild.parentTag === 'ul')
            ) {
                return (
                    <View
                        key={`list-${nodeIndex}-${index}-${key}`}
                        style={{
                            flexDirection: 'row',
                            marginBottom: 0,
                            paddingLeft: 20
                        }}
                    >
                        {prefix}
                        <View style={{ flex: 1 }}>{child}</View>
                    </View>
                );
            }
            return (
                <View
                    key={`list-${nodeIndex}-${index}-${key}`}
                    style={{ flexDirection: 'row' }}
                >
                    {prefix}
                    <View style={{ flex: 1 }}>{child}</View>
                </View>
            );
        });
    return (
        <View style={style} key={key}>
            {children}
        </View>
    );
}
export const ol = ul;

export function iframe (htmlAttribs, children, convertedCSSStyles, passProps) {
    const {
        staticContentMaxWidth,
        tagsStyles,
        classesStyles,
        WebView
    } = passProps;

    const tagStyleHeight = tagsStyles.iframe && tagsStyles.iframe.height;
    const tagStyleWidth = tagsStyles.iframe && tagsStyles.iframe.width;

    const classStyles = _getElementClassStyles(htmlAttribs, classesStyles);
    const classStyleWidth = classStyles.width;
    const classStyleHeight = classStyles.height;

    const attrHeight = htmlAttribs.height ?
        parseInt(htmlAttribs.height) :
        false;
    const attrWidth = htmlAttribs.width ? parseInt(htmlAttribs.width) : false;

    const height = attrHeight || classStyleHeight || tagStyleHeight || 200;
    const width =
        attrWidth || classStyleWidth || tagStyleWidth || staticContentMaxWidth;

    const style = _constructStyles({
        tagName: 'iframe',
        htmlAttribs,
        passProps,
        styleSet: 'VIEW',
        additionalStyles: [{ height, width }]
    });

    const source = htmlAttribs.srcdoc ?
        { html: htmlAttribs.srcdoc } :
        { uri: htmlAttribs.src };

    if (!WebView) {
        console.warn(
            'react-native-render-html',
            'Unable to render <iframe>, please specify the `WebView` prop in <HTML>'
        );
        return null;
    }

    return <WebView key={passProps.key} source={source} style={style} />;
}

export function pre (htlmAttribs, children, convertedCSSStyles, passProps) {
    return (
        <RkText
            rkType='basic'
            key={passProps.key}
            style={{
                fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo'
            }}
        >
            {children}
        </RkText>
    );
}

export function br (htlmAttribs, children, convertedCSSStyles, passProps) {
    return (
        <RkText
            allowFontScaling={passProps.allowFontScaling}
            rkType='basic'
            style={{ height: 1.2 * passProps.emSize, flex: 1 }}
            key={passProps.key}
        >
            {'\n'}
        </RkText>
    );
}

export function textwrapper (
    htmlAttribs,
    children,
    convertedCSSStyles,
    { allowFontScaling, key }
) {
    return (
        <RkText
            allowFontScaling={allowFontScaling}
            rkType='basic'
            key={key}
            style={convertedCSSStyles}
        >
            {children}
        </RkText>
    );
}
