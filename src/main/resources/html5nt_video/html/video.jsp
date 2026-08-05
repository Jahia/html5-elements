<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>

<%-- 'source' is mandatory, but it is a weakreference and therefore carries no referential integrity:
     deleting the target file leaves the reference dangling, and ${source.node} then THROWS
     ItemNotFoundException instead of returning null. 'mandatory' guards the save, not the read, so
     ${not empty source.node} is not a usable guard either - it throws while being evaluated.
     Resolve the target inside c:catch and treat any resolution failure as "no video". --%>
<c:set var="source" value="${currentNode.properties.source}"/>
<c:catch var="sourceNodeError">
    <c:set var="sourceNode" value="${source.node}"/>
</c:catch>

<c:if test="${jcr:isNodeType(currentNode, 'html5mix:videoAdvancedSettings')}">
    <c:set var="autoplay" value="${currentNode.properties.autoplay.boolean}"/>
    <c:set var="controls" value="${currentNode.properties.controls.boolean}"/>
    <c:set var="fallbackContent" value="${currentNode.properties.fallbackContent.string}"/>
    <c:set var="height" value="${currentNode.properties.height.string}"/>
    <c:set var="loop" value="${currentNode.properties.loop.boolean}"/>
    <c:set var="muted" value="${currentNode.properties.muted.boolean}"/>
    <c:set var="poster" value="${currentNode.properties.poster}"/>
    <c:set var="preload" value="${currentNode.properties.preload.string}"/>
    <c:set var="width" value="${currentNode.properties.width.string}"/>
</c:if>
<%-- Fall back to the localized default when the advanced-settings mixin is absent, or when the field
     was cleared. Do NOT re-read the node property after fmt:message: doing so overwrites the resolved
     default with the empty value we just tested for, which silently emptied the fallback text for
     every video that does not carry the html5mix:videoAdvancedSettings mixin. --%>
<c:if test="${empty fallbackContent}">
    <fmt:message key="html5mix_videoAdvancedSettings.fallbackContent.value" var="fallbackContent"/>
</c:if>

<%-- 'poster' is optional, and subject to the same dangling-weakreference caveat as 'source'. --%>
<c:if test="${not empty poster}">
    <c:catch var="posterNodeError">
        <c:set var="posterNode" value="${poster.node}"/>
    </c:catch>
</c:if>

<c:choose>
    <c:when test="${not empty sourceNode}">
        <jcr:nodeProperty node="${sourceNode}" name="jcr:mimeType" var="type"/>
        <c:url var="sourceUrl" value="${sourceNode.url}" context="/"/>
        <video<c:if test="${autoplay}"><c:out value=" "/>autoplay</c:if><c:if
                test="${controls}"><c:out value=" "/>controls</c:if><c:if
                test="${loop}"><c:out value=" "/>loop</c:if><c:if
                test="${muted}"><c:out value=" "/>muted</c:if><c:if
                test="${not empty posterNode}"><c:out value=" "/>poster="${fn:escapeXml(posterNode.url)}"</c:if><c:if
                test="${not empty preload}"><c:out value=" "/>preload="${fn:escapeXml(preload)}"</c:if><c:if
                test="${not empty height}"><c:out value=" "/>height="${fn:escapeXml(height)}"</c:if><c:if
                test="${not empty width}"><c:out value=" "/>width="${fn:escapeXml(width)}"</c:if>>
            <%-- jcr:mimeType originates from the uploaded file and is not constrained server-side (the
                 picker's mime='video/*' filter is a UI hint only), so escape it like any other value. --%>
            <source src="${sourceUrl}" type="${fn:escapeXml(type)}">
            ${fn:escapeXml(fallbackContent)}
        </video>
    </c:when>
    <c:otherwise>
        <%-- Missing or dangling reference: render nothing in live mode, and surface the problem to the
             editor in edit mode rather than failing the whole page fragment. --%>
        <c:if test="${renderContext.editMode}">
            <div class="html5edit html5-video-missing-source">
                <fmt:message key="html5nt_video.missingSource"/>
            </div>
        </c:if>
    </c:otherwise>
</c:choose>
